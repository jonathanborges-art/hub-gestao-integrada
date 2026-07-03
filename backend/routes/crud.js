import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { getDB } from '../db.js';

// Cria um router CRUD genérico para uma coleção do db.data.
// `hideFields`: campos sensíveis (ex.: passwordHash) que nunca devem ir na resposta.
export function crudRouter(collectionName, hideFields = []) {
  const router = Router();

  function sanitize(item) {
    if (!item || hideFields.length === 0) return item;
    const clone = { ...item };
    hideFields.forEach(f => delete clone[f]);
    return clone;
  }

  router.get('/', async (req, res) => {
    const db = await getDB();
    res.json((db.data[collectionName] || []).map(sanitize));
  });

  router.get('/:id', async (req, res) => {
    const db = await getDB();
    const item = (db.data[collectionName] || []).find(i => i.id === req.params.id);
    if (!item) return res.status(404).json({ error: 'Não encontrado' });
    res.json(sanitize(item));
  });

  router.post('/', async (req, res) => {
    const db = await getDB();
    const item = { id: uuid(), criadoEm: new Date().toISOString(), ...req.body };
    db.data[collectionName].push(item);
    await db.write();
    res.status(201).json(sanitize(item));
  });

  router.put('/:id', async (req, res) => {
    const db = await getDB();
    const idx = (db.data[collectionName] || []).findIndex(i => i.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Não encontrado' });
    const body = { ...req.body };
    delete body.passwordHash; // nunca aceitar troca de senha por essa rota genérica
    db.data[collectionName][idx] = { ...db.data[collectionName][idx], ...body, id: req.params.id };
    await db.write();
    res.json(sanitize(db.data[collectionName][idx]));
  });

  router.delete('/:id', async (req, res) => {
    const db = await getDB();
    db.data[collectionName] = (db.data[collectionName] || []).filter(i => i.id !== req.params.id);
    await db.write();
    res.status(204).end();
  });

  return router;
}
