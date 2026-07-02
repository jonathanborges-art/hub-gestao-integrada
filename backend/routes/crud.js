import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { getDB } from '../db.js';

// Cria um router CRUD genérico para uma coleção do db.data
export function crudRouter(collectionName) {
  const router = Router();

  router.get('/', async (req, res) => {
    const db = await getDB();
    res.json(db.data[collectionName] || []);
  });

  router.get('/:id', async (req, res) => {
    const db = await getDB();
    const item = (db.data[collectionName] || []).find(i => i.id === req.params.id);
    if (!item) return res.status(404).json({ error: 'Não encontrado' });
    res.json(item);
  });

  router.post('/', async (req, res) => {
    const db = await getDB();
    const item = { id: uuid(), criadoEm: new Date().toISOString(), ...req.body };
    db.data[collectionName].push(item);
    await db.write();
    res.status(201).json(item);
  });

  router.put('/:id', async (req, res) => {
    const db = await getDB();
    const idx = (db.data[collectionName] || []).findIndex(i => i.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Não encontrado' });
    db.data[collectionName][idx] = { ...db.data[collectionName][idx], ...req.body, id: req.params.id };
    await db.write();
    res.json(db.data[collectionName][idx]);
  });

  router.delete('/:id', async (req, res) => {
    const db = await getDB();
    db.data[collectionName] = (db.data[collectionName] || []).filter(i => i.id !== req.params.id);
    await db.write();
    res.status(204).end();
  });

  return router;
}
