const express = require('express');
const router = express.Router();
const TrafficEvent = require('../models/TrafficEvent');

// @route   POST api/traffic/track
// @desc    Track a user click event
// @access  Public
router.post('/track', async (req, res) => {
    const { elementId, elementType, page } = req.body;

    try {
        const newEvent = new TrafficEvent({
            elementId,
            elementType,
            page
        });

        await newEvent.save();
        res.status(201).json({ msg: 'Traffic event tracked' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/traffic/stats
// @desc    Get aggregated traffic statistics
// @access  Public
router.get('/stats', async (req, res) => {
    try {
        const now = new Date();
        const oneWeekAgo = new Date(now.setDate(now.getDate() - 7));
        const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1)); // Recalculate now for month
        const oneYearAgo = new Date(now.setFullYear(now.getFullYear() - 1)); // Recalculate now for year

        // Lifetime Clicks
        const lifetimeClicks = await TrafficEvent.countDocuments();

        // Yearly Clicks
        const yearlyClicks = await TrafficEvent.countDocuments({ timestamp: { $gte: oneYearAgo } });

        // Monthly Clicks
        const monthlyClicks = await TrafficEvent.countDocuments({ timestamp: { $gte: oneMonthAgo } });

        // Weekly Clicks
        const weeklyClicks = await TrafficEvent.countDocuments({ timestamp: { $gte: oneWeekAgo } });

        // Most/Least Clicked Buttons
        const buttonClicks = await TrafficEvent.aggregate([
            { $match: { elementType: 'button' } },
            { $group: { _id: '$elementId', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        const mostClickedButton = buttonClicks.length > 0 ? buttonClicks[0] : null;
        const leastClickedButton = buttonClicks.length > 0 ? buttonClicks[buttonClicks.length - 1] : null;

        // Most/Least Used Navbars (assuming navbar links have elementType 'navbar-link')
        const navbarClicks = await TrafficEvent.aggregate([
            { $match: { elementType: 'navbar-link' } },
            { $group: { _id: '$elementId', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        const mostUsedNavbar = navbarClicks.length > 0 ? navbarClicks[0] : null;
        const leastUsedNavbar = navbarClicks.length > 0 ? navbarClicks[navbarClicks.length - 1] : null;

        // Click rates for all buttons and navbars
        const allButtonClickRates = await TrafficEvent.aggregate([
            { $match: { elementType: 'button' } },
            { $group: { _id: '$elementId', count: { $sum: 1 } } },
            { $project: { _id: 0, id: '$_id', count: 1 } }
        ]);

        const allNavbarClickRates = await TrafficEvent.aggregate([
            { $match: { elementType: 'navbar-link' } },
            { $group: { _id: '$elementId', count: { $sum: 1 } } },
            { $project: { _id: 0, id: '$_id', count: 1 } }
        ]);

        res.json({
            lifetimeClicks,
            yearlyClicks,
            monthlyClicks,
            weeklyClicks,
            mostClickedButton,
            leastClickedButton,
            mostUsedNavbar,
            leastUsedNavbar,
            buttonClickRates: allButtonClickRates,
            navbarClickRates: allNavbarClickRates
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;