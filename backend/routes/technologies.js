const express = require('express');
const router = express.Router();
const Technology = require('../models/Technology');

// @route   GET api/technologies
// @desc    Get all technologies
// @access  Public
router.get('/', async (req, res) => {
    try {
        const technologies = await Technology.find();
        res.json(technologies);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/technologies
// @desc    Add new technology
// @access  Public
router.post('/', async (req, res) => {
    const { name, category, description, workingPrinciple, codeSnippet } = req.body;

    try {
        const newTechnology = new Technology({
            name,
            category,
            description,
            workingPrinciple,
            codeSnippet
        });

        const technology = await newTechnology.save();
        res.json(technology);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
