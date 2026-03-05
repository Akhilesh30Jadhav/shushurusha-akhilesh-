const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, '../sushrusha_questions_v2_1.json');
const outputFile = path.join(__dirname, '../src/data/scenarios_mcq.json');

const rawData = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));
const questionsDb = rawData.questions;

// Read existing
let existingScenarios = [];
if (fs.existsSync(outputFile)) {
    existingScenarios = JSON.parse(fs.readFileSync(outputFile, 'utf-8'));
}

// Group new ones
const groupedScenarios = {};

function getThumbnail(category) {
    // using default logo for these, or a specific image if available
    return '/images/sushrusha_logo.jpeg';
}

// Find highest Q counter in existing to avoid ID collision
let globalQuestionCounter = 1;
existingScenarios.forEach(sc => {
    sc.questions.forEach(q => {
        const match = q.question_id.match(/Q_(\d+)/);
        if (match) {
            const num = parseInt(match[1]);
            if (num >= globalQuestionCounter) globalQuestionCounter = num + 1;
        }
    });
});

questionsDb.forEach((q) => {
    const groupKey = q.scenario_title.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase();

    if (!groupedScenarios[groupKey]) {
        groupedScenarios[groupKey] = {
            scenario_id: groupKey,
            title: q.scenario_title,
            category: q.category,
            difficulty: q.difficulty || "Medium",
            duration_minutes: q.estimated_time_min || 5,
            thumbnail_url: getThumbnail(q.category),
            short_description: `Learn how to handle ${q.scenario_title} correctly based on guidelines.`,
            language: "en",
            skills_targeted: ["Clinical Assessment", "Guidelines", "Decision Making"],
            questions: []
        };
    }

    const formattedQuestion = {
        question_id: `Q_${globalQuestionCounter++}`,
        patient_prompt: q.patient_feedback,
        mcq_question: q.question,
        options: q.options.map(opt => ({
            option_id: opt.id,
            text: opt.text,
            keywords: [],
            intents: []
        })),
        correct_option_id: q.correct_option_id,
        critical: q.difficulty === 'Hard',
        explanation_correct: "Correct! " + q.explanation,
        explanation_wrong: "Incorrect. " + q.explanation
    };

    groupedScenarios[groupKey].questions.push(formattedQuestion);
});

// Append to existing
const newScenariosArray = Object.values(groupedScenarios);

// Avoid duplicate insertion if script is run multiple times
const existingIds = new Set(existingScenarios.map(s => s.scenario_id));
const toAppend = newScenariosArray.filter(s => !existingIds.has(s.scenario_id));

existingScenarios = existingScenarios.concat(toAppend);

fs.writeFileSync(outputFile, JSON.stringify(existingScenarios, null, 2));

console.log(`Successfully appended ${toAppend.length} scenarios into the database. Total scenarios now: ${existingScenarios.length}`);
