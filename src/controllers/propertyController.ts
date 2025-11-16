import { Request, Response } from 'express';
import { asyncHandler, createError } from '../middleware/errorHandler';
import db from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import cloudinary from '../utils/cloudinary';

const mapProperty = (row: any) => ({
  id: row.id,
  name: row.name,
  description: row.description,
  type: row.type,
  location: row.location,
  photos: row.photos || [],
  ownershipDocument: row.ownership_document || null,
  status: row.status,
  stateChapter: row.state_chapter,
  addedBy: row.added_by,
  addedDate: row.added_date,
  lastUpdated: row.last_updated,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const propertyController = {
  getAllProperties: asyncHandler(async (req: Request, res: Response) => {
    const page = Math.max(parseInt((req.query.page as string) || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt((req.query.limit as string) || '12', 10), 1), 50);
    const search = (req.query.search as string) || (req.query.q as string) || '';
    const state = (req.query.state as string) || (req.query.stateChapter as string);
    const type = req.query.type as string | undefined;
    const status = req.query.status as string | undefined;

    const query = db('properties');

    if (search) {
      query.where((builder) => {
        builder
          .whereILike('name', `%${search}%`)
          .orWhereILike('description', `%${search}%`)
          .orWhereRaw("(location ->> 'address') ILIKE ?", [`%${search}%`]);
      });
    }

    if (state) {
      query.andWhere('state_chapter', state);
    }

    if (type) {
      query.andWhere('type', type);
    }

    if (status) {
      query.andWhere('status', status);
    }

    const totalRow = await query.clone().count<{ count: string }>('* as count').first();
    const total = totalRow ? parseInt(totalRow.count, 10) : 0;

    const rows = await query
      .clone()
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset((page - 1) * limit);

    res.status(200).json({
      success: true,
      message: 'Properties fetched successfully',
      data: rows.map(mapProperty),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  }),

  getPropertyById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const row = await db('properties').where({ id }).first();
    if (!row) throw createError('Property not found', 404);
    res.status(200).json({ success: true, message: 'Property fetched', data: mapProperty(row) });
  }),

  createProperty: asyncHandler(async (req: Request, res: Response) => {
    const { name, description, type, location, stateChapter, ownershipDocument } = req.body;
    const id = uuidv4();
    const [inserted] = await db('properties')
      .insert({
        id,
        name,
        description,
        type,
        location,
        photos: [],
        ownership_document: ownershipDocument || null,
        status: 'ACTIVE',
        state_chapter: stateChapter,
        added_by: (req as any).user?.id || null,
        added_date: new Date(),
        last_updated: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning('*');
    res.status(201).json({ success: true, message: 'Property created', data: mapProperty(inserted) });
  }),

  updateProperty: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const existing = await db('properties').where({ id }).first();
    if (!existing) {
      throw createError('Property not found', 404);
    }
    await db('properties')
      .where({ id })
      .update({ ...req.body, last_updated: new Date(), updated_at: new Date() });
    const updated = await db('properties').where({ id }).first();
    res.status(200).json({ success: true, message: 'Property updated', data: updated ? mapProperty(updated) : null });
  }),

  deleteProperty: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const existing = await db('properties').where({ id }).first();
    if (!existing) {
      throw createError('Property not found', 404);
    }
    await db('properties').where({ id }).del();
    res.status(200).json({
      success: true,
      message: 'Property deleted successfully',
    });
  }),

  uploadPhotos: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const property = await db('properties').where({ id }).first();
    if (!property) {
      throw createError('Property not found', 404);
    }
    const files = (req as any).files || [];
    if (!files.length) {
      throw createError('No files provided', 400);
    }
    const urls: string[] = [];
    for (const file of files) {
      const upload = await cloudinary.uploader.upload(file.path, { folder: 'mcan/properties' });
      urls.push(upload.secure_url);
    }
    const newPhotos = [...(property.photos || []), ...urls];
    const [updated] = await db('properties')
      .where({ id })
      .update({ photos: newPhotos, updated_at: new Date(), last_updated: new Date() })
      .returning('*');
    res.status(200).json({ success: true, message: 'Photos uploaded', data: mapProperty(updated) });
  }),

  getPropertiesForMap: asyncHandler(async (req: Request, res: Response) => {
    const rows = await db('properties').select('id', 'name', 'type', 'state_chapter', 'location');
    const points = rows
      .map((r: any) => ({
        id: r.id,
        name: r.name,
        type: r.type,
        stateChapter: r.state_chapter,
        latitude: r.location?.gpsCoordinates?.latitude,
        longitude: r.location?.gpsCoordinates?.longitude,
      }))
      .filter((p: any) => typeof p.latitude === 'number' && typeof p.longitude === 'number');
    res.status(200).json({ success: true, message: 'Map points', data: points });
  }),
};
