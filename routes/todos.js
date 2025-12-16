const express = require('express');
const Todo = require('../models/Todo');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/todos
router.get('/', auth, async (req, res) => {
  try {
    const todos = await Todo.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(todos);
  } catch (err) {
    console.error('Get todos error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/todos
router.post('/', auth, async (req, res) => {
  try {
    const { title, note, tag } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'title is required' });
    }

    const todo = await Todo.create({
      user: req.user.id,
      title,
      note,
      tag,
    });

    res.status(201).json(todo);
  } catch (err) {
    console.error('Create todo error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/todos/:id
router.patch('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, note, tag, done } = req.body;

    const todo = await Todo.findOne({ _id: id, user: req.user.id });
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    if (title !== undefined) todo.title = title;
    if (note !== undefined) todo.note = note;
    if (tag !== undefined) todo.tag = tag;
    if (done !== undefined) todo.done = done;

    await todo.save();
    res.json(todo);
  } catch (err) {
    console.error('Update todo error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
