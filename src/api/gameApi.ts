import axios from 'axios';
import {Level, Score} from '../types/game';

// ✅ IMPORTANT: change if using Android emulator
// iOS → localhost
// Android → 10.0.2.2
const BASE_URL = 'http://localhost:4010';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// -----------------------------
// GET LEVELS
// -----------------------------
export async function fetchLevels(): Promise<Level[]> {
  try {
    console.log('GET /levels → request');

    const response = await api.get('/levels');

    console.log('GET /levels → status:', response.status);
    console.log('GET /levels → data:', JSON.stringify(response.data, null, 2));

    return Array.isArray(response.data) ? response.data : [];
  } catch (error: any) {
    console.log('GET /levels FAILED');

    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }

    return [];
  }
}

// -----------------------------
// GET SINGLE LEVEL
// -----------------------------
export async function fetchLevel(id: string): Promise<Level> {
  try {
    console.log(`GET /levels/${id}`);

    const response = await api.get(`/levels/${id}`);

    console.log('Level response:', JSON.stringify(response.data, null, 2));

    return response.data;
  } catch (error: any) {
    console.log('GET level FAILED:', error.message);
    throw error;
  }
}

// -----------------------------
// GET SCORES
// -----------------------------
export async function fetchScores(levelId: string): Promise<Score[]> {
  try {
    console.log(`GET /scores?levelId=${levelId}`);

    const response = await api.get('/scores', {
      params: {levelId},
    });

    console.log('Scores response:', JSON.stringify(response.data, null, 2));

    return Array.isArray(response.data) ? response.data : [];
  } catch (error: any) {
    console.log('GET scores FAILED:', error.message);
    return [];
  }
}

// -----------------------------
// POST SCORE (FIX 415 HERE)
// -----------------------------
export async function submitScore(score: Score): Promise<Score> {
  try {
    console.log('POST /scores → sending:', JSON.stringify(score, null, 2));

    const response = await api.post('/scores', score, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    console.log('POST SUCCESS');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));

    return response.data;
  } catch (error: any) {
    console.log('POST FAILED');

    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('Error:', error.message);
    }

    throw error;
  }
}