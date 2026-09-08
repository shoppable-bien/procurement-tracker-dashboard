export function parseCsv(text) {
  const input = String(text || '').replace(/^\uFEFF/, '');
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    const next = input[index + 1];

    if (character === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && character === ',') {
      row.push(field);
      field = '';
      continue;
    }

    if (!inQuotes && character === '\n') {
      row.push(field.replace(/\r$/, ''));
      if (row.some((cell) => cell !== '')) rows.push(row);
      row = [];
      field = '';
      continue;
    }

    field += character;
  }

  if (field !== '' || row.length > 0) {
    row.push(field.replace(/\r$/, ''));
    if (row.some((cell) => cell !== '')) rows.push(row);
  }

  return rows;
}

export function rowsToObjects(rows) {
  if (!rows.length) return { headers: [], rows: [] };
  const headers = rows[0].map((header, index) => String(header || '').trim() || `COLUMN_${index + 1}`);
  const data = rows.slice(1).map((cells) => {
    const record = {};
    headers.forEach((header, index) => {
      const key = Object.prototype.hasOwnProperty.call(record, header) ? `${header}__${index + 1}` : header;
      record[key] = cells[index] ?? '';
    });
    return record;
  });
  return { headers, rows: data };
}
