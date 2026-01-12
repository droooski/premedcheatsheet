import React from "react";
import maleIcon from "../../../assets/icons/male.png";
import femaleIcon from "../../../assets/icons/female.png";
import "./Testimonials.scss";

const Testimonials = () => {
  return (
    <section className="testimonials">
      <div className="container">
        <h2>Hear it from the people that matter the most</h2>

        <div className="testimonials-grid">
          {/* First testimonial */}
          <div className="testimonial-card">
            <div className="testimonial-content">
              <p className="quote">
                "As someone who is starting the pre-med track a bit later than
                others, I definitely felt lost on where to even begin in trying
                to build my application. But{" "}
                <strong>
                  the Premed Profiles gives me so much clarity on what I need to
                  get done before I start applying for med school
                </strong>
                . It also gives me real information about other applicants I
                would not have gotten anywhere else. I highly recommend it to
                other premed students looking for help!"
              </p>
              <div className="testimonial-author">
                <img src={femaleIcon} alt="Emily C." className="author-icon" />
                <p className="author-name">Emily C., Pre-med junior</p>
              </div>
            </div>
          </div>

          {/* Second testimonial */}
          <div className="testimonial-card">
            <div className="testimonial-content">
              <p className="quote">
                "Premed Profiles is an absolute game-changer for anyone
                considering medical school. The ability to explore real student
                bios, including their MCAT scores, extracurriculars, and
                application highlights, offers an incredible resource for both
                current applicants and those just beginning to explore the med
                school journey.{" "}
                <strong>
                  It is so helpful to see what it actually takes to get into
                  different schools
                </strong>{" "}
                and how successful applicants have shaped their paths."
              </p>
              <div className="testimonial-author">
                <img src={maleIcon} alt="Danny B." className="author-icon" />
                <p className="author-name">Danny B., Pre-med junior</p>
              </div>
            </div>
          </div>

          {/* Third testimonial */}
          <div className="testimonial-card">
            <div className="testimonial-content">
              <p className="quote">
                "Before using this database, I had no idea how my stats compared
                to accepted students.{" "}
                <strong>
                  The detailed MCAT, GPA, and extracurricular breakdowns showed
                  me exactly what I needed to work on
                </strong>
                . I landed multiple interviews this cycle, and I know Premed
                Profiles played a huge role!"
              </p>
              <div className="testimonial-author">
                <img src={maleIcon} alt="Michael T." className="author-icon" />
                <p className="author-name">
                  Michael T., Incoming medical student
                </p>
              </div>
            </div>
          </div>

          {/* Fourth testimonial */}
          <div className="testimonial-card">
            <div className="testimonial-content">
              <p className="quote">
                "The cold email templates alone were worth it!{" "}
                <strong>
                  I landed a research position within two weeks of using the
                  emails from Premed Profiles+
                </strong>
                . Plus, the CV template helped me present myself
                professionally."
              </p>
              <div className="testimonial-author">
                <img src={maleIcon} alt="David M." className="author-icon" />
                <p className="author-name">David M., Pre-med sophomore</p>
              </div>
            </div>
          </div>

          {/* Fifth testimonial */}
          <div className="testimonial-card">
            <div className="testimonial-content">
              <p className="quote">
                "I was completely lost on how to make my gap year count.{" "}
                <strong>
                  The database showed me what successful applicants did with
                  their time off, and I tailored my experiences accordingly
                </strong>
                . Now, I feel so much more prepared for the application
                process!"
              </p>
              <div className="testimonial-author">
                <img src={femaleIcon} alt="Sophia L." className="author-icon" />
                <p className="author-name">
                  Sophia L., Taking gap year before applying
                </p>
              </div>
            </div>
          </div>

          {/* Sixth testimonial */}
          <div className="testimonial-card">
            <div className="testimonial-content">
              <p className="quote">
                "I used to spend hours on forums trying to piece together what a
                strong med school application looks like. Premed Profiles laid
                it all out for me in minutes.{" "}
                <strong>
                  Seeing real applicant profiles gave me the confidence to
                  improve my extracurriculars and refine my application
                </strong>
                . Absolute game-changer!"
              </p>
              <div className="testimonial-author">
                <img
                  src={femaleIcon}
                  alt="Jessica R."
                  className="author-icon"
                />
                <p className="author-name">Jessica R., Pre-med junior</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
