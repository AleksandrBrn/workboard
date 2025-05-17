#!/usr/bin/env ts-node

import { generateMentorshipReport, Task, ReportParams } from '../src/lib/mentorshipReportGenerator';
import minimist from 'minimist';
import fs from 'fs';
import path from 'path';
interface BaseReportParams<TTasks> {
  student: string;
  mentor: string;
  mentorPosition: string;
  department: string;
  tasks: TTasks;
  output: string;
}

// Для CLI-аргументов
type CliArgs = BaseReportParams<string> & {
  help?: boolean;
  _?: string[];
  [key: string]: unknown;
};

// Парсим аргументы
const args = minimist(process.argv.slice(2)) as unknown as CliArgs;

if (args.help) {
  console.log(`
Использование:
  generate-report [опции]
Опции:
  --student          ФИО студента
  --mentor          ФИО наставника
  --tasks           JSON-массив задач (например: '[{"name":"Задача 1", "status":"Выполнено"}]')
  --output          Путь для сохранения
  --help            Справка
`);
  process.exit(0);
}

// Преобразуем CLI-аргументы в ReportParams
const parseCliArgs = (args: CliArgs): ReportParams => {
  let tasks: Task[] = [];

  if (args.tasks) {
    try {
      tasks = JSON.parse(args.tasks);
    } catch (e) {
      console.error(
        'Ошибка парсинга задач:',
        e instanceof Error ? e.message : 'Неизвестная ошибка'
      );
      process.exit(1);
    }
  }

  const testTasks: Task[] = [
    { name: 'Задача 1', startDate: '01.01.2025', endDate: '31.05.2025', status: 'Выполнено' },
    { name: 'Задача 2', startDate: '10.05.2025', endDate: '31.05.2025', status: 'Выполнено' },
  ];

  return {
    student: args.student || 'Иванов Иван Иванович',
    mentor: args.mentor || 'Петров Петр Петрович',
    mentorPosition: args.mentorPosition || 'Старший специалист',
    department: args.department || 'Тестовый отдел',
    tasks: tasks.length > 0 ? tasks : testTasks,
    output: args.output || path.join('generated-reports', `report_${Date.now()}.docx`),
  };
};

// Генерация отчёта
try {
  const reportParams = parseCliArgs(args);

  if (!fs.existsSync(path.dirname(reportParams.output))) {
    fs.mkdirSync(path.dirname(reportParams.output), { recursive: true });
  }

  generateMentorshipReport(reportParams);
  console.log('Отчёт успешно создан:', reportParams.output);
} catch (error) {
  console.error('Ошибка:', error instanceof Error ? error.message : 'Неизвестная ошибка');
  process.exit(1);
}
