const test3_city = [
    {
        title: 'Turns and Intersections',
        items: [
            {
                item: 'Traffic Checks',
                checks: [ '1', '1', '1', '1' ]
            },
            {
                item: 'Signal',
                checks: [ '1', '1', '1', '1' ]
            },
            {
                item: 'Correct lane',
                checks: [ '1', '1', '1', '1' ]
            },
            {
                item: 'Decelerates/coast',
                checks: [ '1', '1', '1', '1' ]
            },
            {
                item: 'Smooth stop',
                checks: [ '1', '1', '1', '1' ]
            },
            {
                item: 'Complete stop',
                checks: [ '1', '1', '1', '1' ]
            },
            {
                item: 'Stop line',
                checks: [ '1', '1', '1', '1' ]
            },
            {
                item: 'Roll back',
                checks: [ '1', '1', '1', '1' ]
            },
            {
                item: 'Wheels straight',
                checks: [ '1', '1', '1', '1' ]
            },
            {
                item: 'Outage',
                checks: [ '1', '1', '1', '1' ]
            },
            {
                item: 'Both hands',
                checks: [ '1', '1', '1', '1' ]
            },
            {
                item: 'Gears',
                checks: [ '1', '1', '1', '1' ]
            },
            {
                item: 'Yield',
                checks: [ '1', '1', '1', '1' ]
            },
        ]
    },  // end of block
    {
        title: 'Immediate DQ',
        items: [
            {
                item: 'Seatbelt Violation',
                checks: [ '1' ]
            },
            {
                item: 'Dangerous Action',
                checks: [ '1' ]
            },
            {
                item: 'Vehicle over curb or sidewalk',
                checks: [ '1' ]
            },
            {
                item: 'Violation of Law',
                checks: [ '1' ]
            },
            {
                item: 'Fails to Perform',
                checks: [ '1' ]
            },
        ]
    },  // end of block
    {
        title: 'RR Crossing APPROACH',
        items: [
            {
                item: 'Traffic & train checks',
                checks: [ 'HAZ/Pass' ]
            },
            {
                item: 'Decelerates, coast',
                checks: [ 'HAZ/Pass' ]
            },
            {
                item: 'Right lane',
                checks: [ 'HAZ/Pass' ]
            },
            {
                item: 'Gears',
                checks: [ 'HAZ/Pass' ]
            },
            {
                item: 'Outage',
                checks: [ 'HAZ/Pass' ]
            },
            {
                item: 'Accelerates',
                checks: [ 'HAZ/Pass' ]
            },
            {
                item: '4-ways (HAZ/Pass)',
                checks: [ 'HAZ/Pass' ]
            },
            {
                item: 'Stop 15-50 ft (HAZ/Pass)',
                checks: [ 'HAZ/Pass' ]
            },
            {
                item: 'Stop (HAZ/Pass)',
                checks: [ 'HAZ/Pass' ]
            },
        ]
    },  // end of block
    {
        title: 'Lane Changes',
        items: [
            {
                item: 'Traffic checks',
                checks: [ '1', '1', '1', '1' ]
            },
            {
                item: 'Signal',
                checks: [ '1', '1', '1', '1' ]
            },
            {
                item: 'Spacing',
                checks: [ '1', '1', '1', '1' ]
            },
            {
                item: 'Smooth Change',
                checks: [ '1', '1', '1', '1' ]
            },
            {
                item: 'Cancel Signal',
                checks: [ '1', '1', '1', '1' ]
            },
        ]
    },  // end of block
    {
        title: 'Curve',
        items: [
            {
                item: 'Speed/enter',
                checks: [ '1', '1' ]
            },
            {
                item: 'Speed/through',
                checks: [ '1', '1' ]
            },
            {
                item: 'Maintains lane',
                checks: [ '1', '1' ]
            },
            {
                item: 'Traffic checks',
                checks: [ '1', '1' ]
            },
        ]
    },  // end of block
    {
        title: 'Roadside Stops',
        items: [
            {
                item: 'Traffic checks',
                checks: [ '1', '1' ]
            },
            {
                item: 'Signal on/off',
                checks: [ '1', '1' ]
            },
            {
                item: 'Correct lane',
                checks: [ '1' ]
            },
            {
                item: 'Decelerates, coast',
                checks: [ '1' ]
            },
            {
                item: '4-ways on/off',
                checks: [ '1', '1' ]
            },
            {
                item: 'Parking brake on/off',
                checks: [ '1', '1' ]
            },
            {
                item: 'Position, curb',
                checks: [ '1' ]
            },
            {
                item: 'Blocking traffic, hydrant',
                checks: [ '1' ]
            },
            {
                item: 'Roll back',
                checks: [ '1', '1' ]
            },
            {
                item: 'Engine stall',
                checks: [ '1' ]
            },
            {
                item: 'Accelerates',
                checks: [ '1' ]
            },
        ]
    },  // end of block
    {
        title: 'Freeway',
        items: [
            {
                item: 'Traffic checks',
                checks: [ '1', '1', '1' ]
            },
            {
                item: 'Signal on/off',
                checks: [ '1', '1', '1' ]
            },
            {
                item: 'Accelerate',
                checks: [ '1', '1', '1' ]
            },
            {
                item: 'Merge',
                checks: [ '1', '1', '1' ]
            },
            {
                item: 'Maintains lane',
                checks: [ '1', '1', '1' ]
            },
            {
                item: 'Speed',
                checks: [ '1', '1', '1' ]
            },
            {
                item: 'Following distance',
                checks: [ '1', '1', '1' ]
            },
            {
                item: 'Decelerate',
                checks: [ '1', '1', '1' ]
            },
            {
                item: 'Ramp speed',
                checks: [ '1', '1', '1' ]
            },
        ]
    },  // end of block
    {
        title: 'General Driving',
        items: [
            {
                item: "Uses clutch improperly (shifting, double clutch, didn't ride)",
                checks: [ '1', '1', '1', '1', '1' ]
            },
            {
                item: 'Uses gears improperly (rev/lug engine, clash gears, coast)',
                checks: [ '1', '1', '1', '1', '1' ]
            },
            {
                item: 'Uses brakes improperly (smooth braking, no riding or pumping)',
                checks: [ '1', '1', '1', '1', '1' ]
            },
            {
                item: 'Improper steering (both hands, spokes)',
                checks: [ '1', '1', '1', '1', '1' ]
            },
            {
                item: 'Lane of travel (correct, over lanes, stop lines, gap, etc.)',
                checks: [ '1', '1', '1', '1', '1' ]
            },
            {
                item: 'Regular traffic checks',
                checks: [ '1', '1', '1', '1', '1' ]
            },
            {
                item: 'Improper use of turn signals',
                checks: [ '1', '1', '1', '1', '1' ]
            },
            {
                item: 'Maintains speed',
                checks: [ '1', '1', '1', '1', '1' ]
            },
            {
                item: 'Total Fail',
                checks: [ '100' ]
            },
        ]
    },  // end of block
]


/*

    {
        title: 'Beginning Checks',
        items: [
            {
                item: 'Begin',
                checks: [  ]
            },
        ]
    },  // end of block

*/


module.exports = {
    test3_city
}