import React from "react";
import { PieChart, Pie, Cell } from "recharts";

const ProblemsSolved = ({ totalProblems, easy, medium, hard }) => {
  const data = [
    { name: "Easy", value: easy },
    { name: "Medium", value: medium },
    { name: "Hard", value: hard },
  ];

  const COLORS = ["#00C49F", "#FFBB28", "#FF8042"];

  return (
    <div className="problems-solved">
      <h3>Problems solved: {totalProblems}</h3>
      <div className="chart-container">
        <PieChart width={250} height={250}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
        <div className="problem-info">
          <div className="info-item easy">
            <div className="color-box green"></div>
            <div style={{marginTop: '10px',
              fontSize: '18px',
              fontWeight:"bold",
              color: '#068800', // Dark gray for professional look
              padding: '5px 10px', // Padding around text
            }}> <span>Easy : {easy}</span></div>
          </div>
          <div className="info-item medium">
            <div className="color-box yellow"></div>
            <div style={{marginTop: '10px',
              fontSize: '18px',
              fontWeight:"bold",
              color: '#f79a00', // Dark gray for professional look
              padding: '5px 10px', // Padding around text
            }}><span >medium: {medium}</span></div>
            
          </div>
          <div className="info-item hard">
            <div className="color-box red"></div>
            <div style={{marginTop: '10px',
               fontSize: '18px',
               fontWeight:"bold",
               color:'#cb0000', // Dark gray for professional look
               padding: '5px 10px', // Padding around text
            }}><span >Hard: {hard}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemsSolved;
