import './Table.css';

export interface Column {
  key: string;
  header: string;
  align?: 'left' | 'center' | 'right';
  bold?: boolean;                           // bold text in this column
  render?: (value: any, row: any) => any;
}

interface TableProps {
  columns: Column[];
  data: any[];
  footer?: Record<string, any>;            // key → value for footer row
  caption?: string;
  className?: string;
  onRowClick?: (row: any) => void;
  selectedIndex?: number;
}

export const Table = ({
  columns,
  data,
  footer,
  caption,
  className = '',
  onRowClick,
  selectedIndex,
}: TableProps) => (
  <div className={`spz-table-container ${className}`}>
    <table className="spz-table">
      {caption && <caption>{caption}</caption>}

      <thead>
        <tr>
          {columns.map(col => (
            <th key={col.key} className={`text-${col.align ?? 'left'}`}>
              {col.header}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {data.map((row, i) => (
          <tr
            key={i}
            onClick={() => onRowClick?.(row)}
            className={[
              onRowClick ? 'clickable' : '',
              selectedIndex === i ? 'selected' : '',
            ].join(' ')}
          >
            {columns.map(col => (
              <td
                key={col.key}
                className={[
                  `text-${col.align ?? 'left'}`,
                  col.bold ? 'bold' : '',
                ].join(' ')}
              >
                {col.render ? col.render(row[col.key], row) : row[col.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>

      {footer && (
        <tfoot>
          <tr>
            {columns.map(col => (
              <td key={col.key} className={`text-${col.align ?? 'left'}`}>
                {footer[col.key] ?? ''}
              </td>
            ))}
          </tr>
        </tfoot>
      )}
    </table>
  </div>
);
