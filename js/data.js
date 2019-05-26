// Orbital Element Data for all bodies.
// Taken from JPL Horizons.
// Data for fictional stations etc. is based on guesses.

const DEG_TO_RAD = Math.PI / 180;

Mercury = new StellarBody(
    name = "Mercury",
    elements = new Elements(
        M = 1.072381116824175E-04,
        a = 3.870982252717257E-01,
        e = 2.056302512089075E-01,
        i = 7.005014199657344E+00,
        Om = 4.833053756455964E+01,
        Tp = 2451502.287118767854,
        period = 8.796910250314700E+01
    ),
    type = BodyType.PLANET
)

Venus = new StellarBody(
    name = "Venus",
    elements = new Elements(
        M = 3.434414209814972E-02 * DEG_TO_RAD,
        a = 7.233268496749391E-01,
        e = 6.755697267164094E-03,
        i = 3.394589632336535E+00 * DEG_TO_RAD,
        Om = 7.667837563371675E+01 * DEG_TO_RAD,
        Tp = 2451513.719921561424,
        period = 2.246982938196676E+02,
    ),
    type = BodyType.PLANET
)

Earth = new StellarBody(
    name = "Earth",
    elements = new Elements(
        M = 3.597030259349321E+02 * DEG_TO_RAD,
        a = 1.000371833989169E+00,
        e= 1.704239716781501E-02,
        i = 2.669113820737183E-04 * DEG_TO_RAD,
        Om= 1.639752443600624E+02 * DEG_TO_RAD,
        Tp = 2451546.338324738666,
        period= 3.654600908298652E+02
    ),
    type = BodyType.PLANET
)

Mars = new StellarBody(
    name = "Mars",
    elements = new Elements(
        M = 1.224294833404008E-03 * DEG_TO_RAD,
        a = 1.523678184302188E+00,
        e = 1.849876609221010E+00,
        i = 1.849876609221010E+00 * DEG_TO_RAD,
        Om = 4.956199966373916E+01 * DEG_TO_RAD,
        Tp = 2451508.062864925712,
        period = 6.869707263001874E+02
    ),
    type = BodyType.PLANET
)

Jupiter = new StellarBody(
    name = "Jupiter",
    elements = new Elements(
        M = 1.920906961572723E-02 * DEG_TO_RAD,
        a = 5.205108607585142E+00,
        e = 4.892306349049538E-02,
        i = 1.304657636931146E+00 * DEG_TO_RAD,
        Om = 1.004889638146475E+02 * DEG_TO_RAD,
        Tp = 2451318.996390545741,
        period = 4.335467468895084E+03
    ),
    type = BodyType.PLANET
)

Saturn = new StellarBody(
    name = "Saturn",
    elements = new Elements(
        M = 3.564146777524872E+02 * DEG_TO_RAD,
        a = 9.581451986179690E+00,
        e = 5.559928865006970E-02,
        i = 2.484368789620612E+00 * DEG_TO_RAD,
        Om = 1.136930139344162E+02 * DEG_TO_RAD,
        Tp = 2452736.556183533743,
        period = 1.083136929300940E+04
    ),
    type = BodyType.PLANET
)

Uranus = new StellarBody(
    name = "Uranus",
    elements = new Elements(
        M = 5.723002576152608E-01 * DEG_TO_RAD,
        a = 1.922994520785785E+01,
        e = 4.439340361752947E-02,
        i = 7.723573015717081E-01 * DEG_TO_RAD,
        Om = 7.395999806493768E+01 * DEG_TO_RAD,
        Tp = 2439317.813763227314,
        period = 3.080037591703138E+04
    ),
    type = BodyType.PLANET
)

Neptune = new StellarBody(
    name = "Neptune",
    elements = new Elements(
        M = 5.801820777191402E-01 * DEG_TO_RAD,
        a = 3.009700462148000E+01,
        e = 1.114803368793832E-02,
        i = 1.773467472159835E+00 * DEG_TO_RAD,
        Om = 1.317693887550994E+02 * DEG_TO_RAD,
        Tp = 2467190.152574779000,
        period = 6.030761530338429E+04
    ),
    type = BodyType.PLANET
)

Ceres = new StellarBody(
    name = "Ceres",
    elements = new Elements(
        M = 2.973877359494692E-03 * DEG_TO_RAD,
        a = 2.766494282136041E+00,
        e = 7.837505767652506E-02,
        i = 1.058336086929457E+01 * DEG_TO_RAD,
        Om = 8.049436516467529E+01,
        Tp = 2451516.163117751945,
        period = 1.680711192752127E+03
    ),
    type = BodyType.ASTEROID
)