const test1_preTrip_A_incab = [
    {
        title: 'Beginning Checks',
        items: [
            {
                item: 'Begin',
                checks: ['Chock Wheels(A)', 'Seat Belt', 'Key On', '90 PSI'],
            },
            {
                item: 'Exterior',
                checks: ['Headlights H/L', 'Front Sig L/R/4', 'Clear', 'Rear Sig L/R/4', 'Brake'],
            },
            {
                item: 'Safety Start',
                checks: ['Neut', 'Brake', 'Start', 'Clutch(M)', 'ABS', 'DEF', '1/8']
            },
            {
                item: 'Air Pressure',
                checks: ['Cut at 120-140', 'Cut out PSI', 'Gear/Neut', 'Key Off', 'Key On', 'Release T,T Brakes']
            },
        ]
    },  // end of block
    {
        // 'important' flag means that if at least 1 fail, then all test is fail
        title: 'Air Checks',
        items: [
            {
                item: 'Air Leak',
                checks: [ '4 PSI, 3 PSI, 1 Min', 'Brake', 'Stabilize', '1 Min', 'Drop < 4', 'Pass' ],
                important: true
            },
            {
                item: 'Low Air Warn',
                checks: [ 'at or Above 55', 'Pump Brake', 'Note PSI', 'Working Prop' ],
                important: true
            },
            {
                item: 'T, T Prot Valve',
                checks: [ 'Should pop Approx 40', 'Pump Brake', 'Note PSI', 'Working Prop' ],
                important: true
            },
            {
                item: 'Safety Start',
                checks: [ 'Remove Chocks(A)', 'Neut', 'Brake', 'Start', 'Clutch(M)' ],
                important: true
            },
        ]
    },  // end of block
    {
        title: 'Tractor & Trailer Brake Checks',
        items: [
            {
                item: 'Tractor Brake',
                checks: [ 'Release Trailer Brake', 'Tractor BR Off', 'Truck no Move', 'Brake On' ]
            },
            {
                item: 'Trailer Brake',
                checks: [ 'Release Tractor Brake', 'Trailer BR Off', 'Truck no Move', 'Brake On' ]
            },
            {
                item: 'Service Brake',
                checks: [ 'Release Both', 'Move 5-10 Ft', 'Working, No R/L', 'Brakes On' ]
            },
        ]
    },  // end of block
    {
        title: 'In Cab Inspection',
        items: [
            {
                item: 'Seat belt',
                checks: [ 'Securely Mounted', 'Cut, Frayed' ]
            },
            {
                item: 'Safety Equip',
                checks: [ '3 triangles', 'Fuses' ]
            },
            {
                item: 'Fire Extinguish',
                checks: [ 'Securely mounted', 'Full Charge', 'Up to Date' ]
            },
            {
                item: 'Horns',
                checks: [ 'Air, City', 'Working (demo)' ]
            },
            {
                item: 'Oil Pressure',
                checks: [ 'Normal', 'Warning Light Off' ]
            },
            {
                item: 'Voltmeter',
                checks: [ 'Shows Alternator Charging' ]
            },
            {
                item: 'Indicators',
                checks: [ 'Left', 'Right', 'High Beam', '4 way' ]
            },
            {
                item: 'Temp Gauge',
                checks: [ 'Normal', 'Warning Light Off' ]
            },
            {
                item: 'Wind, Mirrors',
                checks: [ 'Sec Mounted', 'Clean', 'No Crack', 'No Chips', 'No Damage', 'No Obstructions', 'Mirrors Adjust' ]
            },
            {
                item: 'Wipe, Wash',
                checks: [ 'Arms, Blade Sec Mounted', 'No Damage', 'Working Smooth', 'Fluid' ]
            },
            {
                item: 'Heat, Defrost',
                checks: [ 'Heater Working', 'Defrost Working', 'Demo' ]
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
    test1_preTrip_A_incab
}