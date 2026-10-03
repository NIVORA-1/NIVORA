import { NextResponse } from 'next/server';
import {
  generatePersonalizedStudyPlan,
  explainAcademicConcept,
  solvePreviousYearQuestion,
  generateAdaptiveQuiz,
  calculateAttendanceTelemetry,
  debugAndAnalyzeCode,
  generateIeeeCitation,
} from '@/lib/academicEngine';

export const dynamic = 'force-dynamic';

/**
 * /api/ai — Nivora AI Workspace backend (academic tools)
 *
 * Supports both structured tool execution (tool: 'study-plan' | 'explain-concept' | ...)
 * and legacy slash command strings (`/study-plan ...`).
 *
 * Fully integrated with academic synthesis engine, Crossref DOI resolver, and optional LLMs.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Check for explicit structured tool call
    const tool = body.tool;

    if (tool) {
      switch (tool) {
        case 'study-plan': {
          const result = await generatePersonalizedStudyPlan({
            subject: body.subject,
            topics: body.topics,
            examDate: body.examDate,
            currentLevel: body.currentLevel,
            dailyHours: body.dailyHours,
            weakTopics: body.weakTopics,
            stream: body.stream,
          });
          return NextResponse.json({ success: true, tool, data: result });
        }

        case 'explain-concept': {
          const result = await explainAcademicConcept({
            concept: body.concept,
            difficulty: body.difficulty,
            subject: body.subject,
            stream: body.stream,
          });
          return NextResponse.json({ success: true, tool, data: result });
        }

        case 'solve-pyq': {
          const result = await solvePreviousYearQuestion({
            question: body.question,
            examType: body.examType,
            subject: body.subject,
            stream: body.stream,
          });
          return NextResponse.json({ success: true, tool, data: result });
        }

        case 'quiz-me': {
          const result = await generateAdaptiveQuiz({
            subject: body.subject,
            topic: body.topic,
            difficulty: body.difficulty,
            numQuestions: body.numQuestions,
            stream: body.stream,
          });
          return NextResponse.json({ success: true, tool, data: result });
        }

        case 'simulate-attendance': {
          const result = calculateAttendanceTelemetry({
            totalClasses: body.totalClasses,
            classesAttended: body.classesAttended,
            requiredPct: body.requiredPct,
            plannedFutureClasses: body.plannedFutureClasses,
            plannedFutureAbsences: body.plannedFutureAbsences,
            subjectName: body.subjectName,
          });
          return NextResponse.json({ success: true, tool, data: result });
        }

        case 'debug-code': {
          const result = await debugAndAnalyzeCode({
            language: body.language,
            code: body.code,
            errorDescription: body.errorDescription,
          });
          return NextResponse.json({ success: true, tool, data: result });
        }

        case 'cite-ieee': {
          const result = await generateIeeeCitation({
            mode: body.mode || 'manual',
            doi: body.doi,
            url: body.url,
            title: body.title,
            authors: body.authors,
            publicationType: body.publicationType,
            venue: body.venue,
            year: body.year,
            volume: body.volume,
            issue: body.issue,
            pages: body.pages,
          });
          return NextResponse.json({ success: true, tool, data: result });
        }

        default:
          return NextResponse.json({ error: `Unknown tool: ${tool}` }, { status: 400 });
      }
    }

    // Legacy prompt handling
    const prompt = body.prompt ?? body.query;
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt or tool parameter is required' }, { status: 400 });
    }

    const trimmed = prompt.trim();
    let command = 'chat';
    let query = trimmed;

    if (trimmed.startsWith('/')) {
      const parts = trimmed.split(' ');
      command = parts[0].substring(1);
      query = parts.slice(1).join(' ');
    }

    // Dispatch legacy slash commands to academic engine
    if (command === 'explain-concept' || query.toLowerCase().includes('explain')) {
      const res = await explainAcademicConcept({ concept: query, stream: body.stream });
      return NextResponse.json({
        response: `### ${res.concept} (${res.difficulty} — ${res.domain})\n\n**Intuitive Explanation:**\n${res.simpleExplanation}\n\n**Technical Breakdown:**\n${res.detailedExplanation}\n\n**Step-by-Step Operations:**\n${res.stepByStepBreakdown.join('\n')}\n\n**Formulas & Invariants:**\n${res.formulas.join('\n')}\n\n**Exam High-Yield Summary:**\n${res.examSummary}`,
        data: res,
      });
    }

    if (command === 'solve-pyq' || query.toLowerCase().includes('pyq') || query.toLowerCase().includes('b+ tree')) {
      const res = await solvePreviousYearQuestion({ question: query, stream: body.stream });
      return NextResponse.json({
        response: `### Solved Examination Question (${res.subject})\n\n**Problem Analysis:**\n${res.questionAnalysis}\n\n**Step-by-Step Derivation:**\n${res.stepByStepSolution.join('\n\n')}\n\n**Final Result:**\n${res.finalAnswer}\n\n**Conceptual Explanation:**\n${res.explanation}\n\n**Exam Tips:**\n${res.examTips.map(t => `- ${t}`).join('\n')}`,
        data: res,
      });
    }

    if (command === 'study-plan' || query.toLowerCase().includes('study plan') || query.toLowerCase().includes('revision')) {
      const res = await generatePersonalizedStudyPlan({ subject: query, stream: body.stream });
      const scheduleLines = res.schedule
        .map(
          (s) =>
            `| Day ${s.day} (${s.date}) | ${s.focusTopic} | ${s.durationHours} hrs | ${s.tasks[0]} |`
        )
        .join('\n');
      return NextResponse.json({
        response: `### Personalized Revision Study Plan — ${res.subject}\n\n**Target:** ${res.daysLeft} Days to Exam | **Daily Commitment:** ${res.dailyHours} hrs\n\n| Day | Focus Topic | Duration | Key Task |\n|-----|-------------|----------|----------|\n${scheduleLines}\n\n**Weak Topic Strategy:**\n${res.weakTopicStrategy}\n\n**Advisory:**\n${res.tips.map(t => `- ${t}`).join('\n')}`,
        data: res,
      });
    }

    if (command === 'simulate-attendance') {
      const res = calculateAttendanceTelemetry({
        totalClasses: 45,
        classesAttended: 38,
        requiredPct: 75,
        plannedFutureClasses: 10,
        plannedFutureAbsences: 2,
        subjectName: query || 'Database Management Systems',
      });
      return NextResponse.json({
        response: `### Attendance Telemetry Simulation\n- **Subject**: ${res.subjectName}\n- **Current Compliance**: ${res.currentPct}% (${res.classesAttended}/${res.totalClasses} sessions)\n- **Statutory Threshold**: ${res.requiredPct}%\n- **Buffer**: ${res.maxMissesAllowed} safe absences remaining\n- **Projected Impact**: ${res.projectedPct}% after simulation\n\n**Advice:** ${res.advice}`,
        data: res,
      });
    }

    if (command === 'debug-code') {
      const res = await debugAndAnalyzeCode({ language: 'c', code: query });
      return NextResponse.json({
        response: `### Code Analysis & Verification\n\n**Status:** ${res.hasErrors ? 'Bugs Detected' : 'Verified'}\n\n**Issues Found:**\n${res.detectedIssues.map(i => `- ${i}`).join('\n')}\n\n**Corrected Code:**\n\`\`\`${res.language}\n${res.correctedCode}\n\`\`\`\n\n**Complexity:** Time: ${res.timeComplexity.after} | Space: ${res.spaceComplexity.after}`,
        data: res,
      });
    }

    if (command === 'cite-ieee') {
      const res = await generateIeeeCitation({ mode: 'manual', title: query });
      return NextResponse.json({
        response: `### IEEE Citation Generated\n\n**IEEE Standard:**\n${res.ieeeFormat}\n\n**BibTeX Entry:**\n\`\`\`bibtex\n${res.bibtex}\n\`\`\`\n\n**Validation:** ${res.validationNotes}`,
        data: res,
      });
    }

    if (command === 'quiz-me') {
      const res = await generateAdaptiveQuiz({ subject: 'Computer Science', topic: query });
      return NextResponse.json({
        response: `### Generated Adaptive Quiz: ${res.topic}\n\n${res.questions.map((q, idx) => `**Q${idx + 1} (${q.difficulty.toUpperCase()}):** ${q.question}\n${q.options.map((opt, oIdx) => `  ${String.fromCharCode(65 + oIdx)}) ${opt}`).join('\n')}\n*Correct Answer: ${String.fromCharCode(65 + q.correctIndex)} — ${q.explanation}*\n`).join('\n')}`,
        data: res,
      });
    }

    // Default academic response
    const defaultExpl = await explainAcademicConcept({ concept: query, stream: body.stream });
    return NextResponse.json({
      response: `### ${defaultExpl.concept}\n\n${defaultExpl.simpleExplanation}\n\n${defaultExpl.detailedExplanation}`,
      data: defaultExpl,
    });
  } catch (error) {
    console.error('/api/ai route error:', error);
    return NextResponse.json({ error: 'Academic workspace synthesis failed.' }, { status: 500 });
  }
}
