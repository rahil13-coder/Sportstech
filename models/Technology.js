const mongoose = require('mongoose');

const TechnologySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Cricket', 'Football', 'Tennis', 'General'] // Add more categories as needed
    },
    description: {
        type: String,
        required: true
    },
    workingPrinciple: {
        type: String,
        required: true
    },
    codeSnippet: {
        type: String,
        default: '// No specific code snippet available for this technology.'
    }
});

module.exports = mongoose.model('Technology', TechnologySchema);
