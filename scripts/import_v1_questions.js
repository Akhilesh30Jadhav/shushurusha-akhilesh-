const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, '../sushrusha_questions_v1.json');
const outputFile = path.join(__dirname, '../src/data/scenarios_mcq.json');

const rawData = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));
const questionsDb = rawData.questions;

// We need to group flat questions by scenario_id
const groupedScenarios = {};

// Helper to assign a default thumbnail based on category
function getThumbnail(category) {
    if (category.includes('ANC') || category.includes('Antenatal')) return '/images/anc_danger_signs_01.png';
    if (category.includes('PNC') || category.includes('Postnatal')) return '/images/pnc_bleeding_fever_01.png';
    if (category.includes('Child') || category.includes('Newborn')) return '/images/newborn_not_feeding_01.png';
    if (category.includes('Labour') || category.includes('Intrapartum')) return '/images/hypertension_urgent_01.png';
    return '/images/sushrusha_logo.jpeg';
}

let globalQuestionCounter = 1;

questionsDb.forEach((q) => {
    // If we haven't seen this scenario group yet, initialize it
    // Group by scenario_title because scenario_id in this JSON is unique per question!
    const groupKey = q.scenario_title.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase();

    if (!groupedScenarios[groupKey]) {
        groupedScenarios[groupKey] = {
            scenario_id: groupKey,
            title: q.scenario_title,
            category: q.category,
            difficulty: q.difficulty || "Medium",
            duration_minutes: q.estimated_time_min || 5,
            thumbnail_url: getThumbnail(q.category),
            short_description: `Learn how to handle ${q.scenario_title} correctly based on WHO protocols.`,
            language: "en",
            skills_targeted: ["Clinical Assessment", "WHO Protocols", "Decision Making"],
            questions: []
        };
    }

    // Map the question to the app's required format
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
        critical: q.difficulty === 'Hard', // treat hard questions as critical
        explanation_correct: "Correct! " + q.explanation,
        explanation_wrong: "Incorrect. " + q.explanation
    };

    groupedScenarios[groupKey].questions.push(formattedQuestion);
});

const finalScenariosArray = Object.values(groupedScenarios);

fs.writeFileSync(outputFile, JSON.stringify(finalScenariosArray, null, 2));

console.log(`Successfully migrated ${questionsDb.length} questions into ${finalScenariosArray.length} scenarios.`);
