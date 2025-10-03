import { Request, Response } from 'express';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import db from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import cloudinary from '../utils/cloudinary';

export const propertyController = {
  getAllProperties: asyncHandler(async (req: Request, res: Response) => {
    const { page = 1, limit = 10, search, stateChapter, type, status } = req.query as any;
    let query = db('properties').select('*');
    if (search) query = query.whereILike('name', `%${search}%`);
    if (stateChapter) query = query.where('state_chapter', stateChapter);
    if (type) query = query.where('type', type);
    if (status) query = query.where('status', status);
    const data = await query.limit(Number(limit)).offset((Number(page) - 1) * Number(limit));
    res.status(200).json({ success: true, message: 'Properties fetched', data });
  }),

  getPropertyById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const row = await db('properties').where({ id }).first();
    if (!row) throw createError('Property not found', 404);
    res.status(200).json({ success: true, message: 'Property fetched', data: row });
  }),

  createProperty: asyncHandler(async (req: Request, res: Response) => {
    const { name, description, type, location, stateChapter, ownershipDocument } = req.body;
    const id = uuidv4();
    await db('properties').insert({
      id,
      name,
      description,
      type,
      location,
      photos: [],
      ownership_document: ownershipDocument || null,
      status: 'ACTIVE',
      state_chapter: stateChapter,
      added_by: (req as any).user?.id,
      added_date: new Date(),
      last_updated: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    });
    res.status(201).json({ success: true, message: 'Property created', data: { id } });
  }),

  updateProperty: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await db('properties').where({ id }).update({ ...req.body, last_updated: new Date(), updated_at: new Date() });
    res.status(200).json({ success: true, message: 'Property updated' });
  }),

  deleteProperty: asyncHandler(async (req: Request, res: Response) => {
    // TODO: Implement delete property
    logger.info('Delete property endpoint called');
    res.status(200).json({
      success: true,
      message: 'Delete property endpoint - implementation pending',
      data: null,
    });
  }),

  uploadPhotos: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const files = (req as any).files || [];
    const urls: string[] = [];
    for (const f of files) {
      const upload = await cloudinary.uploader.upload(f.path, { folder: 'mcan/properties' });
      urls.push(upload.secure_url);
    }
    const row = await db('properties').select('photos').where({ id }).first();
    const newPhotos = [...(row?.photos || []), ...urls];
    await db('properties').where({ id }).update({ photos: newPhotos, updated_at: new Date() });
    res.status(200).json({ success: true, message: 'Photos uploaded', data: newPhotos });
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
