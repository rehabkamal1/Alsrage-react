import React from "react";
import { Placeholder } from "react-bootstrap";

const TableSkeleton = ({ rows = 5, columns = 8 }) => {
  return (
    <div className="table-responsive">
      <table className="table mb-0">
        <thead className="table-light">
          <tr>
            {Array(columns)
              .fill()
              .map((_, i) => (
                <th key={i}>
                  <Placeholder animation="glow">
                    <Placeholder xs={12} />
                  </Placeholder>
                </th>
              ))}
          </tr>
        </thead>
        <tbody>
          {Array(rows)
            .fill()
            .map((_, rowIdx) => (
              <tr key={rowIdx}>
                {Array(columns)
                  .fill()
                  .map((_, colIdx) => (
                    <td key={colIdx}>
                      <Placeholder animation="glow">
                        <Placeholder xs={12} />
                      </Placeholder>
                    </td>
                  ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableSkeleton;
