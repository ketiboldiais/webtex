import { EditorThemeClasses } from "lexical";
import docstyle from "../ui/styles/Editor.module.scss";

type Schema = {
  version: number;
  colors: string[];
  fontFamilies: Record<string, string>;
  fontsize: {
    min: number;
    max: number;
  };
};

export const schema: Schema = {
  version: 1,
  fontsize: {
    min: 10,
    max: 70,
  },
  colors: [
    "#d0021b",
    "#f5a623",
    "#f8e71c",
    "#8b572a",
    "#7ed321",
    "#417505",
    "#bd10e0",
    "#9013fe",
    "#4a90e2",
    "#50e3c2",
    "#b8e986",
    "#000000",
    "#4a4a4a",
    "#9b9b9b",
    "#ffffff",
  ],
  fontFamilies: {
    ["Andale Mono"]: "Andale Mono",
    ["Arial"]: "Arial",
    ["Arial Black"]: "Arial Black",
    ["Arial Narrow"]: "Arial Narrow",
    ["Arial Rounded MT Bold"]: "Arial Rounded MT Bold",
    ["Baskerville"]: "Baskerville",
    ["Book Antiqua"]: "Book Antiqua",
    ["Bookman"]: "Bookman",
    ["KaTeX_Main"]: "CMU Serif",
    ["Copperplate"]: "Copperplate",
    ["Courier New"]: "Courier New",
    ["cursive"]: "Cursive",
    ["fantasy"]: "Fantasy",
    ["Garamond"]: "Garamond",
    ["Georgia"]: "Georgia",
    ["Hoefler Text"]: "Hoefler Text",
    ["Lucida Bright"]: "Lucida Bright",
    ["Monaco"]: "Monaco",
    ["monospace"]: "Monospace",
    ["Palatino"]: "Palatino",
    ["Papyrus"]: "Papyrus",
    ["sans-serif"]: "Sans-serif",
    ["serif"]: "Serif",
    ["Times New Roman"]: "Times New Roman",
    ["Trebuchet MS"]: "Trebuchet MS",
    ["Verdana"]: "Verdana",
  },
};

export const theme: EditorThemeClasses = {
  ltr: docstyle.ltr,
  rtl: docstyle.rtl,
  paragraph: docstyle.paragraph,
  quote: docstyle.quote,
  heading: {
    h1: docstyle.h1,
    h2: docstyle.h2,
    h3: docstyle.h3,
    h4: docstyle.h4,
    h5: docstyle.h5,
    h6: docstyle.h6,
  },
  list: {
    nested: {
      listitem: docstyle.nested_list_item,
    },
    olDepth: [
      docstyle.ol1,
      docstyle.ol2,
      docstyle.ol3,
      docstyle.ol4,
      docstyle.ol5,
    ],
    ul: docstyle.ul,
    listitem: docstyle.list_item,
  },
  image: docstyle.image,
  link: docstyle.link,
  text: {
    bold: docstyle.bold,
    italic: docstyle.italic,
    underline: docstyle.underline,
    strikethrough: docstyle.strike,
    underlineStrikethrough: docstyle.strike_and_underline,
    subscript: docstyle.subscript,
    superscript: docstyle.superscript,
  },
  table: docstyle.table,
  tableAddColumns: docstyle.table_add_columns,
  tableAddRows: docstyle.table_add_rows,
  tableCell: docstyle.table_cell,
  tableCellActionButton: docstyle.table_cell_action_button,
  tableCellActionButtonContainer: docstyle.table_cell_action_button_container,
  tableCellEditing: docstyle.table_cell_editing,
  tableCellHeader: docstyle.table_cell_header,
  tableCellPrimarySelected: docstyle.table_cell_primary_selected,
  tableCellResizer: docstyle.table_cell_resizer,
  tableCellSelected: docstyle.table_cell_selected,
  tableCellSortedIndicator: docstyle.table_cell_sorted_indicator,
  tableResizeRuler: docstyle.table_cell_resize_ruler,
  tableSelected: docstyle.table_selected,
};
