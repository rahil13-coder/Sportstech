import React, { useState } from "react";

const CricketTechnologies = ({ cricketTech }) => {
  const [show, setShow] = useState(false);

  return (
    <section className="cricket">
      <h2>CRICKET TECHNOLOGIES</h2>
      <button className= "c1" onClick={() => setShow(!show)}>
        {show ? "Close Cricket Technologies" : "View Cricket Technologies"}
      </button>
      {show && (
        <div>
          {cricketTech.length > 0 ? (
            cricketTech.map((tech) => (
              <div key={tech._id}>
                <div>
                  <div>
                    <h5>{tech.name}</h5>
                    <p>
                      <strong>Description:</strong> {tech.description}
                    </p>
                    <p>
                      <strong>Working Principle:</strong> {tech.workingPrinciple}
                    </p>
                    <pre>
                      <code>{tech.codeSnippet}</code>
                    </pre>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>No technologies found in this category.</p>
          )}
        </div>
      )}
    </section>
  );
};

export default CricketTechnologies;
