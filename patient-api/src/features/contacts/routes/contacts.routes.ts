import { Router } from 'express';
import { authenticateJWT } from '../../../config/jwt';
import * as ContactsController from '../controllers/contacts.controller';

const router = Router();

// Contacts CRUD
router.get('/contacts', authenticateJWT, ContactsController.listContacts);
router.get('/contacts/:id', authenticateJWT, ContactsController.getContact);
router.put('/contacts/:id', authenticateJWT, ContactsController.updateContact);
router.get('/contacts/:id/history', authenticateJWT, ContactsController.getContactHistory);

export default router;

