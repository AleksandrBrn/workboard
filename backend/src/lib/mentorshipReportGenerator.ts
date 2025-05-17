import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  AlignmentType,
  HeadingLevel,
} from 'docx';
import fs from 'fs';

// ==================== Типы (позже вынесем в отдельный файл) ====================
export interface Task {
  name: string;
  startDate: string;
  endDate: string;
  status: 'Выполнено' | 'В процессе' | 'Не выполнено';
}

export interface BaseReportParams<TTasks> {
  student: string;
  mentor: string;
  mentorPosition: string;
  department: string;
  tasks: TTasks;
  output: string;
}

export type ReportParams = BaseReportParams<Task[]>;

export type MeasurementUnit = 'twip' | 'cm' | 'pt';
export type MarginPreset = 'default' | 'narrow' | 'wide';

interface Measurement {
  value: number;
  unit: MeasurementUnit;
}

export interface FontSettings {
  family: string;
  size: number;
  color?: string;
  bold?: boolean;
  italic?: boolean;
}

export interface ParagraphSpacing {
  line?: Measurement;
  before?: Measurement;
  after?: Measurement;
}

export interface DocumentStyle<T extends FontSettings = FontSettings> {
  id: string;
  name: string;
  baseFont: T;
  spacing: ParagraphSpacing;
  margins?: {
    preset?: MarginPreset;
    custom?: Partial<Record<'top' | 'right' | 'bottom' | 'left', Measurement>>;
  };
}

export interface DocumentStyles {
  default: DocumentStyle;
  header?: DocumentStyle<Omit<FontSettings, 'color'>>;
  footer?: DocumentStyle;
  special?: Record<string, DocumentStyle>;
}

// ==================== Константы стилей ====================
const DEFAULT_FONT: string = 'Times New Roman';
const DEFAULT_TEXT_SIZE: number = 24;
const SMALL_TEXT_SIZE: number = 12;
const DEFAULT_PAGE_MARGINS = {
  top: 567,
  right: 567,
  bottom: 567,
  left: 1134,
};

export const DEFAULT_STYLES: DocumentStyles = {
  default: {
    id: 'Normal',
    name: 'Normal Style',
    baseFont: {
      family: DEFAULT_FONT,
      size: DEFAULT_TEXT_SIZE,
    },
    spacing: {
      line: { value: 276, unit: 'twip' },
      before: { value: 200, unit: 'twip' },
      after: { value: 200, unit: 'twip' },
    },
    margins: {
      preset: 'default',
    },
  },
  header: {
    id: 'Header',
    name: 'Header Style',
    baseFont: {
      family: DEFAULT_FONT,
      size: SMALL_TEXT_SIZE,
      bold: true,
    },
    spacing: {
      line: { value: 240, unit: 'twip' },
    },
  },
};

// ==================== Вспомогательные функции ====================
const createParagraph = (
  text: string,
  align: keyof typeof AlignmentType = 'LEFT',
  fontSettings?: Partial<FontSettings>
): Paragraph => {
  const { family = DEFAULT_FONT, size = DEFAULT_TEXT_SIZE, ...rest } = fontSettings || {};

  return new Paragraph({
    alignment: AlignmentType[align],
    children: [
      new TextRun({
        text,
        size,
        font: family,
        ...rest,
      }),
    ],
  });
};

const createTableCell = (
  text: string,
  options: {
    isBold?: boolean;
    size?: number;
    align?: keyof typeof AlignmentType;
    font?: string;
  } = {}
): TableCell => {
  const { isBold = false, size = DEFAULT_TEXT_SIZE, align = 'LEFT', font = DEFAULT_FONT } = options;

  return new TableCell({
    children: [
      new Paragraph({
        children: [new TextRun({ text, bold: isBold, size, font })],
        alignment: AlignmentType[align],
      }),
    ],
  });
};

const createTableRow = (
  columns: string[],
  options?: {
    isBold?: boolean;
    size?: number;
    align?: keyof typeof AlignmentType;
    font?: string;
  }
): TableRow => {
  return new TableRow({
    children: columns.map((text) => createTableCell(text, options)),
  });
};

const createTableHeader = () => {
  return createTableRow(
    [
      '№',
      'Содержание учебных задач',
      'Дата начала выполнения',
      'Дата завершения',
      'Статус выполнения учебных задач (в процессе, выполнено, не выполнено)',
    ],
    { isBold: true }
  );
};

// ==================== Основные компоненты документа ====================
const createDocumentHeader = () => [
  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    alignment: AlignmentType.RIGHT,
    children: [
      new TextRun({
        text: 'Приложение №1',
        bold: true,
        font: DEFAULT_FONT,
        size: SMALL_TEXT_SIZE,
      }),
    ],
  }),
  createParagraph('к Регламенту об утверждении методики', 'RIGHT'),
  createParagraph('оплаты за наставничество', 'RIGHT'),
];

const createApprovalBlock = () =>
  new Paragraph({
    alignment: AlignmentType.RIGHT,
    children: [
      new TextRun({ text: 'УТВЕРЖДАЮ', bold: true, break: 1 }),
      new TextRun({ text: 'Директор', break: 1 }),
      new TextRun({ text: '', break: 2 }),
      new TextRun({ text: '___________________', break: 1 }),
      new TextRun({ text: 'ФИО ДИРЕКТОРА', break: 1 }),
      new TextRun({ text: '', break: 1 }),
      new TextRun({ text: '"____" ___________ 20___ г.', break: 1 }),
    ],
  });

const createReportTitle = () =>
  new Paragraph({
    text: 'План-отчет по выполнению учебных задач за период (отчетный месяц)',
    alignment: AlignmentType.CENTER,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 400, after: 200 },
  });

const createTasksTable = (tasks: Task[]): Table => {
  return new Table({
    rows: [
      createTableHeader(),
      ...tasks.map((task, index) =>
        createTableRow([
          (index + 1).toString(),
          task.name,
          task.startDate,
          task.endDate,
          task.status,
        ])
      ),
    ],
    width: { size: 100, type: 'pct' },
  });
};

// ==================== Основная функция ====================
export const generateMentorshipReport = ({
  student,
  mentor,
  mentorPosition,
  department,
  tasks,
  output,
}: ReportParams): void => {
  const doc = new Document({
    styles: {
      paragraphStyles: [
        {
          id: DEFAULT_STYLES.default.id,
          name: DEFAULT_STYLES.default.name,
          run: DEFAULT_STYLES.default.baseFont,
          paragraph: {
            spacing: {
              line: DEFAULT_STYLES.default.spacing.line?.value,
            },
          },
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            margin: DEFAULT_PAGE_MARGINS,
          },
        },
        children: [
          ...createDocumentHeader(),
          createApprovalBlock(),
          createReportTitle(),
          createParagraph(`Наименование подразделения: ${department}`),
          createParagraph(`ФИО ученика: ${student}`),
          createTasksTable(tasks),
          createParagraph(`Дата: ${new Date().toLocaleDateString('ru-RU')}`),
          createParagraph(`ФИО и должность наставника: ${mentor}, ${mentorPosition}`),
          createParagraph(`Подразделение: ${department}`),
        ],
      },
    ],
  });

  Packer.toBuffer(doc)
    .then((buffer) => {
      fs.writeFileSync(output, buffer);
      console.log(`Отчёт сохранён в файл "${output}"`);
    })
    .catch((error) => {
      console.error('Ошибка при генерации документа:', error);
    });
};

// ==================== Пример использования ====================
// if (require.main === module) {
//   generateMentorshipReport({
//     student: 'Иванов Иван Иванович',
//     mentor: 'Петров Петр Петрович',
//     mentorPosition: 'Старший наставник',
//     department: 'Отдел разработки',
//     tasks: [
//       { name: 'ЗАДАЧА ОДИН', startDate: '01.05.2025', endDate: '10.05.2025', status: 'Выполнено' },
//       { name: 'ЗАДАЧА ДВА', startDate: '01.05.2025', endDate: '31.05.2025', status: 'Выполнено' },
//       { name: 'ЗАДАЧА ТРИ', startDate: '07.05.2025', endDate: '07.05.2025', status: 'Выполнено' },
//       {
//         name: 'ЗАДАЧА ЧЕТЫРЕ',
//         startDate: '12.05.2025',
//         endDate: '31.05.2025',
//         status: 'В процессе',
//       },
//     ],
//     output: 'Отчёт_по_наставничеству.docx',
//   });
// }
