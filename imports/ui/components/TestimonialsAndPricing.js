import React from 'react';


const TestimonialsAndPricing = React.createClass({
  render: () => {
    return (

      <section className="testimonials-and-pricing" id="testimonials-and-pricing">
        <div className="container">
          <div className="row">
            <div className="col-lg-6">
              <div className="section-heading text-center">
                <h3>What People Are Saying About Us</h3>
                <hr />
              </div>
              <div className="testimonial">
                <i>These past 2 months, MeetupFiller brought in over 40 RSVPs for us and really bumped up our summer numbers. We were able to automatically offer discounts to members in our community that haven't been to one of our events in 2 or more consecutive weeks, so that non-regulars would be encouraged to return.</i>
                <div className="testimonial-signature">
                  <h6><i>Caleb Olson - National Director, Play Soccer 2 Give</i></h6>
                  <div className="logo">
                    <img src="img/ps2g_logo.jpeg" className="img-fluid" alt />
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="section-heading text-center">
                <h3>Pricing</h3>
                <hr />
              </div>
              <div className="pricing">
                <div className="price">
                  <h2>18%</h2>
                  <small>of generated revenue</small>
                </div>
                <div className="pricing-features">
                  <ul>
                    <li>Capacity-based discount settings</li>
                    <li>Time-based discount settings</li>
                    <li>Custom email signatures</li>
                    <li>White-glove support</li>
                    <li>Weekly PayPal payouts</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
});

export default TestimonialsAndPricing;
