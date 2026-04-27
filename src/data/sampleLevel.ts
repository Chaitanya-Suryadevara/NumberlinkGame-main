import {Level} from '../types/game';

export const sampleLevel: Level = {
  id: 'local-easy',
  size: 5,
  difficulty: 'easy',
  pairs: [
    {id: 'A', color: '#e74c3c', start: {x: 0, y: 0}, end: {x: 4, y: 0}},
    {id: 'B', color: '#3498db', start: {x: 0, y: 1}, end: {x: 4, y: 1}},
    {id: 'C', color: '#2ecc71', start: {x: 0, y: 2}, end: {x: 4, y: 2}},
    {id: 'D', color: '#f59e0b', start: {x: 0, y: 3}, end: {x: 4, y: 3}},
    {id: 'E', color: '#8b5cf6', start: {x: 0, y: 4}, end: {x: 4, y: 4}},
  ],
};