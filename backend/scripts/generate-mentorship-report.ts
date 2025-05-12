#!/usr/bin/env ts-node

import { generateMentorshipReport } from '../src/lib/mentorshipReportGenerator';
import minimist from 'minimist';
import fs from 'fs';
import path from 'path';

// Парсим аргументы командной строки
const args = minimist(process.argv.slice(2));

// Получаем значения из аргументов или используем значения по умолчанию
const student = args.student || 'Имя студента';
const mentor = args.mentor || 'Имя наставника';
const output = args.output || `generated-reports/report-${Date.now()}.docx`;

// Создаём директорию для отчётов, если её нет
const dir = path.dirname(output);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// Генерируем отчёт
generateMentorshipReport({ student, mentor, output });
