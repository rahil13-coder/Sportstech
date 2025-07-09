import React, { useState } from "react";

const TennisTechnologies = ({ tennisTech }) => {
  const [show, setShow] = useState(false);

  return (
    <section className="tennis">
      <h2>Tennis TECHNOLOGIES</h2>
      <button className= "t1"onClick={() => setShow(!show)}>
        {show ? "Close Tennis Technologies" : "View Tennis Technologies"}
      </button>
      {show && (
        <div>
          {tennisTech.length > 0 ? (
            tennisTech.map((tech) => (
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

export default TennisTechnologies;