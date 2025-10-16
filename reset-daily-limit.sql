-- Reset daily exercise usage for testing
DELETE FROM daily_exercise_usage WHERE date = CURRENT_DATE;
