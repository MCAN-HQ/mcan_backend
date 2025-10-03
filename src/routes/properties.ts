import { Router } from 'express';
import { propertyController } from '../controllers/propertyController';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorize';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/v1/properties:
 *   get:
 *     summary: Get all properties
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: stateChapter
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [MOSQUE, OFFICE, HALL, SCHOOL, OTHER]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, UNDER_MAINTENANCE, AVAILABLE, OCCUPIED]
 *     responses:
 *       200:
 *         description: Properties retrieved successfully
 */
router.get('/',
  propertyController.getAllProperties
);

/**
 * @swagger
 * /api/v1/properties/{id}:
 *   get:
 *     summary: Get property by ID
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Property retrieved successfully
 *       404:
 *         description: Property not found
 */
router.get('/:id',
  propertyController.getPropertyById
);

/**
 * @swagger
 * /api/v1/properties:
 *   post:
 *     summary: Create new property
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - type
 *               - location
 *               - stateChapter
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [MOSQUE, OFFICE, HALL, SCHOOL, OTHER]
 *               location:
 *                 type: object
 *                 properties:
 *                   address:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   gpsCoordinates:
 *                     type: object
 *                     properties:
 *                       latitude:
 *                         type: number
 *                       longitude:
 *                         type: number
 *               stateChapter:
 *                 type: string
 *               ownershipDocument:
 *                 type: string
 *     responses:
 *       201:
 *         description: Property created successfully
 */
router.post('/',
  authorize(['SUPER_ADMIN', 'NATIONAL_ADMIN', 'STATE_AMEER', 'STATE_SECRETARY']),
  propertyController.createProperty
);

/**
 * @swagger
 * /api/v1/properties/{id}:
 *   put:
 *     summary: Update property
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *               location:
 *                 type: object
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, UNDER_MAINTENANCE, AVAILABLE, OCCUPIED]
 *     responses:
 *       200:
 *         description: Property updated successfully
 *       404:
 *         description: Property not found
 */
router.put('/:id',
  propertyController.updateProperty
);

/**
 * @swagger
 * /api/v1/properties/{id}:
 *   delete:
 *     summary: Delete property
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Property deleted successfully
 *       404:
 *         description: Property not found
 */
router.delete('/:id',
  authorize(['SUPER_ADMIN', 'NATIONAL_ADMIN']),
  propertyController.deleteProperty
);

/**
 * @swagger
 * /api/v1/properties/{id}/photos:
 *   post:
 *     summary: Upload property photos
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Photos uploaded successfully
 */
router.post('/:id/photos',
  propertyController.uploadPhotos
);

/**
 * @swagger
 * /api/v1/properties/map:
 *   get:
 *     summary: Get properties for map view
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: bounds
 *         schema:
 *           type: string
 *         description: Map bounds in format "lat1,lng1,lat2,lng2"
 *     responses:
 *       200:
 *         description: Properties for map retrieved successfully
 */
router.get('/map',
  propertyController.getPropertiesForMap
);

export default router;
