const test = require('node:test');
const assert = require('node:assert/strict');

// Set up mock localStorage before requiring app logic
global.localStorage = {
  _store: {},
  getItem(k) { return this._store[k] || null; },
  setItem(k, v) { this._store[k] = String(v); },
  removeItem(k) { delete this._store[k]; },
  clear() { this._store = {}; }
};

const app = require('../app.js');
const {
  DAY,
  NOW,
  todayKey,
  clamp,
  sample,
  shuffle,
  escapeHtml,
  GrammarDatabase,
  Storage,
  AnswerChecker,
  SpacedRepetition,
  ProgressTracker,
  ExerciseGenerator,
  LearningEngine
} = app;

test('Helper Utilities', async (t) => {
  await t.test('clamp correctly bounds numbers', () => {
    assert.equal(clamp(5, 0, 10), 5);
    assert.equal(clamp(-5, 0, 10), 0);
    assert.equal(clamp(15, 0, 10), 10);
  });

  await t.test('todayKey returns YYYY-MM-DD format string', () => {
    const key = todayKey();
    assert.match(key, /^\d{4}-\d{2}-\d{2}$/);
  });

  await t.test('escapeHtml escapes dangerous HTML characters', () => {
    assert.equal(escapeHtml('<script>alert("xss") & \'test\'</script>'), '&lt;script&gt;alert(&quot;xss&quot;) &amp; &#39;test&#39;&lt;/script&gt;');
    assert.equal(escapeHtml(null), '');
    assert.equal(escapeHtml(undefined), '');
  });

  await t.test('sample picks an element from array', () => {
    const arr = [10, 20, 30];
    const picked = sample(arr);
    assert.ok(arr.includes(picked));
  });

  await t.test('shuffle preserves elements and array length', () => {
    const arr = [1, 2, 3, 4, 5];
    const shuffled = shuffle(arr);
    assert.equal(shuffled.length, 5);
    assert.deepEqual([...shuffled].sort(), [1, 2, 3, 4, 5]);
  });
});

test('GrammarDatabase', async (t) => {
  await t.test('contains all expected grammar topics', () => {
    assert.ok(Array.isArray(GrammarDatabase.topics));
    assert.ok(GrammarDatabase.topics.length >= 20);
  });

  await t.test('retrieves topic by ID via get()', () => {
    const topic = GrammarDatabase.get('present_simple');
    assert.ok(topic);
    assert.equal(topic.id, 'present_simple');
    assert.equal(topic.title, 'Present Simple');
  });

  await t.test('returns undefined for non-existent topic ID', () => {
    assert.equal(GrammarDatabase.get('unknown_topic'), undefined);
  });

  await t.test('contains valid irregular verbs list', () => {
    assert.ok(Array.isArray(GrammarDatabase.irregular));
    assert.ok(GrammarDatabase.irregular.length >= 10);
    const go = GrammarDatabase.irregular.find(v => v[0] === 'go');
    assert.deepEqual(go, ['go', 'went', 'gone']);
  });

  await t.test('contains grammar contrasts list', () => {
    assert.ok(Array.isArray(GrammarDatabase.contrasts));
    assert.ok(GrammarDatabase.contrasts.length > 0);
  });
});

test('AnswerChecker', async (t) => {
  await t.test('normalizes answers and handles contractions', () => {
    assert.equal(AnswerChecker.normalize('I am happy.'), "i'm happy");
    assert.equal(AnswerChecker.normalize('Do not go!'), "don't go");
  });

  await t.test('checks equivalence between user answer and correct answers', () => {
    assert.ok(AnswerChecker.equivalent('I am fine.', "I'm fine"));
    assert.ok(AnswerChecker.equivalent('does not work', "doesn't work"));
    assert.ok(AnswerChecker.equivalent('bought', ['bought', 'did buy']));
    assert.ok(!AnswerChecker.equivalent('wrong answer', 'correct answer'));
  });
});

test('Storage module', async (t) => {
  await t.test('initializes default state and persists topics', () => {
    Storage.reset();
    const state = Storage.state;
    assert.equal(state.version, 2);
    assert.ok(state.topics.present_simple);
    assert.equal(state.topics.present_simple.mastery, 10);
  });

  await t.test('replace updates state and fills missing topics', () => {
    Storage.replace({ version: 2, totals: { answered: 5, correct: 5 }, topics: {} });
    assert.equal(Storage.state.totals.answered, 5);
    assert.ok(Storage.state.topics.present_simple);
  });
});

test('SpacedRepetition', async (t) => {
  await t.test('updates interval and repetitions on correct answer', () => {
    const ts = { mastery: 10, attempts: 0, correct: 0, errors: 0, interval: 0, repetitions: 0, dueDate: 0 };
    SpacedRepetition.update(ts, true, 1);
    assert.equal(ts.repetitions, 1);
    assert.ok(ts.interval > 0);
    assert.ok(ts.dueDate > NOW());
  });

  await t.test('resets interval and repetitions on incorrect answer', () => {
    const ts = { mastery: 50, attempts: 5, correct: 4, errors: 1, interval: 7, repetitions: 3, dueDate: 0 };
    SpacedRepetition.update(ts, false, 1);
    assert.equal(ts.repetitions, 0);
    assert.equal(ts.interval, 0.007);
  });

  await t.test('isDue accurately evaluates due status', () => {
    assert.ok(SpacedRepetition.isDue({ dueDate: 0 }));
    assert.ok(SpacedRepetition.isDue({ dueDate: NOW() - 1000 }));
    assert.ok(!SpacedRepetition.isDue({ dueDate: NOW() + 1000000 }));
  });
});

test('ProgressTracker', async (t) => {
  await t.test('maps mastery score to status label', () => {
    assert.equal(ProgressTracker.status(10), 'New');
    assert.equal(ProgressTracker.status(30), 'Learning');
    assert.equal(ProgressTracker.status(50), 'Weak');
    assert.equal(ProgressTracker.status(70), 'Good');
    assert.equal(ProgressTracker.status(85), 'Strong');
    assert.equal(ProgressTracker.status(95), 'Mastered');
  });

  await t.test('determines exercise difficulty based on topic mastery', () => {
    Storage.reset();
    Storage.state.topics.present_simple.mastery = 20;
    assert.equal(ProgressTracker.difficultyFor('present_simple'), 1);
    Storage.state.topics.present_simple.mastery = 60;
    assert.equal(ProgressTracker.difficultyFor('present_simple'), 2);
    Storage.state.topics.present_simple.mastery = 85;
    assert.equal(ProgressTracker.difficultyFor('present_simple'), 3);
  });

  await t.test('records exercise results and updates mastery and error tracking', () => {
    Storage.reset();
    const ex = { id: 'test-1', topicId: 'present_simple', difficulty: 1, prompt: 'She ___ (work).', answer: 'works', explanation: '3-rd person -s' };

    // Correct attempt
    ProgressTracker.record(ex, true, 'works', 'practice');
    assert.equal(Storage.state.totals.answered, 1);
    assert.equal(Storage.state.totals.correct, 1);
    assert.ok(Storage.state.topics.present_simple.mastery > 10);

    // Incorrect attempt
    ProgressTracker.record(ex, false, 'work', 'practice');
    assert.equal(Storage.state.totals.answered, 2);
    assert.equal(Storage.state.totals.correct, 1);
    assert.ok(Storage.state.errors['present_simple:fill'] || Storage.state.errors['present_simple']);
  });

  await t.test('calculates overall average mastery', () => {
    Storage.reset();
    assert.equal(ProgressTracker.overallMastery(), 10);
  });
});

test('ExerciseGenerator', async (t) => {
  await t.test('generates valid Present Simple exercise', () => {
    const ex = ExerciseGenerator.generate('present_simple', 1, 'all');
    assert.equal(ex.topicId, 'present_simple');
    assert.ok(ex.prompt);
    assert.ok(ex.answer);
  });

  await t.test('generates irregular verbs practice set', () => {
    const list = ExerciseGenerator.irregular(5);
    assert.equal(list.length, 5);
    list.forEach(ex => {
      assert.ok(ex.prompt);
      assert.ok(ex.answer);
    });
  });

  await t.test('generates diagnostic test session exercises', () => {
    const diag = ExerciseGenerator.diagnostic();
    assert.equal(diag.length, 36);
    diag.forEach(ex => assert.ok(ex.diagnostic));
  });

  await t.test('generates daily plan exercises with target count', () => {
    Storage.reset();
    const daily = ExerciseGenerator.daily(15);
    assert.equal(daily.length, 15);
  });

  await t.test('generates mixed grammar exercises', () => {
    const mixed = ExerciseGenerator.mixed(10);
    assert.equal(mixed.length, 10);
  });
});

test('LearningEngine', async (t) => {
  await t.test('manages complete learning session lifecycle', () => {
    Storage.reset();
    const exercises = [
      { id: 'ex-1', topicId: 'present_simple', type: 'fill', prompt: 'I ___ (be).', answer: 'am', difficulty: 1, explanation: 'I am' },
      { id: 'ex-2', topicId: 'to_be', type: 'choice', prompt: 'She ___ happy.', answer: 'is', difficulty: 1, explanation: 'She is' }
    ];

    LearningEngine.start(exercises, 'practice', 'Test Session');
    assert.equal(LearningEngine.session.mode, 'practice');
    assert.equal(LearningEngine.current().id, 'ex-1');

    // Submit correct answer
    const res1 = LearningEngine.submit('am');
    assert.ok(res1.correct);
    assert.equal(LearningEngine.session.correct, 1);

    LearningEngine.next();
    assert.equal(LearningEngine.current().id, 'ex-2');

    // Submit answer for 2nd exercise
    const res2 = LearningEngine.submit('is');
    assert.ok(res2.correct);
    assert.equal(LearningEngine.session.correct, 2);

    LearningEngine.next();
    assert.equal(LearningEngine.session.finished, true);
    assert.equal(Storage.state.sessions.length, 1);
  });

  await t.test('handles empty answer submission gracefully', () => {
    const exercises = [
      { id: 'ex-1', topicId: 'present_simple', type: 'fill', prompt: 'I ___ (be).', answer: 'am', difficulty: 1 }
    ];
    LearningEngine.start(exercises, 'practice', 'Test Session');
    const res = LearningEngine.submit('');
    assert.ok(res.empty);
  });

  await t.test('schedules retries for incorrect answers in standard practice session', () => {
    Storage.reset();
    const exercises = [
      { id: 'ex-1', topicId: 'present_simple', type: 'fill', prompt: 'He ___ (work).', answer: 'works', difficulty: 2 },
      { id: 'ex-2', topicId: 'to_be', type: 'fill', prompt: 'They ___ (be).', answer: 'are', difficulty: 1 }
    ];

    LearningEngine.start(exercises, 'practice', 'Retry Test');
    LearningEngine.submit('work'); // wrong answer
    assert.ok(LearningEngine.session.queue.length > 2, 'Retry exercise was appended to queue');
  });
});
