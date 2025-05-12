import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun } from 'docx';
import fs from 'fs';

interface ReportParams {
  student: string;
  mentor: string;
  output: string;
}

export const generateMentorshipReport = ({ student, mentor, output }: ReportParams): void => {
  const createParagraph = (text: string): Paragraph =>
    new Paragraph({ children: [new TextRun(text), new TextRun('\n\n')] });

  const createTableRow = (columns: string[]): TableRow =>
    new TableRow({
      children: columns.map((text) => new TableCell({ children: [new Paragraph(text)] })),
    });

  const createTable = (): Table =>
    new Table({
      rows: [
        createTableRow(['Задача', 'Дата выполнения', 'Статус']),
        createTableRow(['Задача 1', '02.05.2025', 'Выполнено']),
        createTableRow(['Задача 2', '03.05.2025', 'В процессе']),
      ],
    });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          createParagraph('Отчёт по наставничеству'),
          createParagraph('Служебный текст...'),
          createParagraph(`ФИО студента: ${student}`),
          createTable(),
          createParagraph(`ФИО наставника: ${mentor}`),
          createParagraph('Служебный текст...'),
          createParagraph('Конец отчета'),
        ],
      },
    ],
  });

  Packer.toBuffer(doc).then((buffer) => {
    fs.writeFileSync(output, buffer);
    console.log(`Отчёт сохранён в файл "${output}"`);
  });
};
