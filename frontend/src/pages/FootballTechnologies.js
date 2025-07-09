import React, { useState } from "react";

const FootballTechnologies = ({ footballTech }) => {
  const [show, setShow] = useState(false);

  return (
    <section className="football">
      <h2>FOOTBALL TECHNOLOGIES</h2>
      <button className="f1" onClick={() => setShow(!show)}>
        {show ? "Close Football Technologies" : "View Football Technologies"}
      </button>
      {show && (
        <div>
          {footballTech.length > 0 ? (
            footballTech.map((tech) => (
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

export default FootballTechnologies;