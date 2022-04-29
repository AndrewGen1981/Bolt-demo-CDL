const test1_preTrip_A_outcab = [
    {
        title: 'Front of Vehicle, Lights and Reflectors',
        items: [
            {
                item: 'Lights, Reflect',
                checks: [ 'Sec Mounted', 'Clean', 'Missing', 'Damaged', 'Color' ]
            },
            {
                item: 'Headlights',
                checks: [ 'Clear', 'Clean', 'Damaged', 'No Leaks, Puddles' ]
            },
        ]
    },  // end of block
    {
        title: 'Engine Compartment',
        items: [
            {
                item: 'Coolant',
                checks: [ 'Point', 'Safe Operating Range', 'Check at Res or Remove Cap' ]
            },
            {
                item: 'Hoses, Fittings',
                checks: [ 'Securely Mounted', 'Leaks', 'Abrasions', 'Bulges', 'Cuts' ]
            },
            {
                item: 'Alternator',
                checks: [ 'Point', 'Belt Driven', 'Sec Mount', 'Works', 'Damage', 'Frayed', 'Worn', 'Cracked', '1/2 - 3/4 Inch', 'Wires: Secure', 'Damage', 'Loose' ]
            },
            {
                item: 'Water Pump',
                checks: [ 'Point', 'Belt/Gear', 'Sec Mount', 'Working', 'Damage', 'Leak' ]
            },
            {
                item: 'Air Compress',
                checks: [ 'Point', 'Gear', 'Sec Mount', 'Working', 'Damage', 'Leak' ]
            },
            {
                item: 'Oil Level',
                checks: [ 'Checked at Dipstick', 'Safe Op Range above Refill' ]
            },
            {
                item: 'Power Steer',
                checks: [ 'Point', 'Belt/Gear', 'Sec Mount', 'Working', 'Damage', 'Leak', 'Above Refill' ]
            },
            {
                item: 'Steer Linkage',
                checks: [ 'Point', 'Links', 'Arms', 'Rods', 'To/From Box', 'Worn', 'Cracked', 'Joints', 'Sockets', 'Loose', 'LMNB' ]
            },
            {
                item: 'Steer Gear Box',
                checks: [ 'Point', 'Sec Mount', 'Damage', 'Leak', 'LMNB', 'Powers Steer Hoses & Fittings: Loose', 'Damaged', 'Leak' ]
            },
        ]
    },  // end of block
    {
        title: 'Front Suspension',
        items: [
            {
                item: 'Leaf Spring Mounts, Brackets',
                checks: [ 'Sec Mount', 'LMNB', 'Bushings' ]
            },
            {
                item: 'Leaf Springs',
                checks: [ 'Missing', 'Shifted', 'Bent', 'Cracked', 'Damaged' ]
            },
            {
                item: 'Leaf Spring Hangers',
                checks: [ 'Sec Mount', 'Cracked', 'Broken' ]
            },
            {
                item: 'U-Bolts',
                checks: [ 'Sec Mount', 'LMNB' ]
            },
            {
                item: 'Shock Absorbers',
                checks: [ 'Sec Mount', 'Leaking' ]
            },
        ]
    },  // end of block
    {
        title: 'Front Air Brakes',
        items: [
            {
                item: 'Hoses & Lines',
                checks: [ 'Supply Air to Br Chambers', 'Sec Mount', 'Leak', 'Crack', 'Worn', 'Frayed' ]
            },
            {
                item: 'Brake Chambers',
                checks: [ 'Sec Mount', 'Leak', 'Crack', 'Dent', 'Loose, Missing Clamp' ]
            },
            {
                item: 'Slack Adjusters & Pushrods',
                checks: [ 'Sec Mount', 'Bent', 'Broken', 'Loose', 'Missing Parts', 'No more 1 Inch by hand when brakes released' ]
            },
            {
                item: 'Drums & Linings',
                checks: [ 'Cracks', 'Dents', 'Holes', 'LMB', 'Linings not thin', 'Oil', 'Grease', 'Debris' ]
            },
        ]
    },  // end of block
    {
        title: 'Steer Tires & Rims',
        items: [
            {
                item: 'Steer Tires',
                checks: [ 'Evenly worn', 'Tread 4/32', 'Side Walls Cuts', 'Bulges', 'Damage', 'Check Inflation w/ Gauge' ]
            },
            {
                item: 'Rims & Hibs',
                checks: [ 'Rims Damage', 'Bent', 'Welds' ]
            },
            {
                item: 'Bolt Holes',
                checks: [ 'Cracks', 'Damage', 'Loose/Missing Lug', 'Rust', 'Shiny' ]
            },
            {
                item: 'Valve Stem, Cap',
                checks: [ 'Missing', 'Broken', 'Damaged', 'Leaking' ]
            },
            {
                item: 'Hub Oil Seal',
                checks: [ 'Crack', 'Damaged', 'Leaking', 'Check Oil by removing Cap' ]
            },
        ]
    },  // end of block
    {
        title: 'Side & Rear of Tractor',
        items: [
            {
                item: 'Mirrors & Doors',
                checks: [ 'Brackets Sec Mount', 'Damage' ]
            },
            {
                item: 'Door Hinges',
                checks: [ 'Clean', 'Secure', 'Damage', 'Opens', 'Seal damage/missing' ]
            },
            {
                item: 'Fuel Tank, Cap',
                checks: [ 'Sec Mount', 'Damage', 'Tank Leak', 'Cap: Tight', 'Missing', 'Cap Leak' ]
            },
            {
                item: 'DEF Tank, Cap',
                checks: [ 'Sec Mount', 'Damage', 'Tank Leak', 'Cap: Tight', 'Missing', 'Cap Leak' ]
            },
            {
                item: 'Catwalk & Steps',
                checks: [ 'Solid', 'Sec Mount', 'Clean', 'Debris' ]
            },
            {
                item: 'Frame & Cross Mem',
                checks: [ 'Sec Mount', 'Bent', 'Broken', 'Cracked', 'Missing', 'Welds' ]
            },
            {
                item: 'Drive Shaft',
                checks: [ 'Bent', 'Twisted', 'Cracked' ]
            },
            {
                item: 'U-Joints',
                checks: [ 'Secure', 'Damaged', 'Foreign Objects' ]
            },
            {
                item: 'Torque Arm',
                checks: [ 'Sec Mount', 'Damaged' ]
            },
            {
                item: 'Air & Electrical Lines',
                checks: [ 'Electric: Secure', 'Locked', 'Glad Hands Locked', 'Damage', 'Leak', 'Tangled', 'Rubbing', 'Dragging' ]
            },
            {
                item: 'Lines & Fittings',
                checks: [ 'Cut', 'Cracked', 'Pinched', 'Worn', 'Leaking' ]
            },
            {
                item: 'Platform Base',
                checks: [ 'Sec Mount to Frame', 'Broken', 'Cracked', 'Damaged' ]
            },
            {
                item: 'Skid Plate',
                checks: [ 'Sec Mount to Platform', 'Greased', 'Broken', 'No Space' ]
            },
            {
                item: 'Apron',
                checks: [ 'Bent', 'Cracked', 'Broken', 'Flat on SP' ]
            },
            {
                item: 'Release Arm',
                checks: [ 'Secure', 'Locked' ]
            },
            {
                item: 'Locking Jaws',
                checks: [ 'Locked around Shank', 'Kingpin not Damaged' ]
            },
            {
                item: 'Mud Flaps',
                checks: [ 'Sec Mount', 'Damage' ]
            },
            {
                item: 'Tail Lights',
                checks: [ 'Reflectors', 'Signals', 'Brake', 'Reverse', 'Sec Mount', 'Damage', 'Clean', 'Color' ]
            },
        ]
    },  // end of block
    {
        title: 'Drive Tires & Rims',
        items: [
            {
                item: 'Same as Front',
                checks: [ 'Tires', 'Rims', 'Valves', 'Valve Stems', 'Bolt Holes', 'Lug' ]
            },
            {
                item: '3 Differences',
                checks: [ 'Tread 2/32', 'Budd Space: Even', 'Bent', 'Cracked', 'Damage', 'Objects', 'Axle Seal Leaks' ]
            },
        ]
    },  // end of block
    {
        title: 'Rear Axle Suspension',
        items: [
            {
                item: 'Same as Front',
                checks: [ 'Leaf Spring Mounts', 'Brackets', 'Leaf Springs', 'Hangers', 'Bushings', 'U-Bolts', 'Shocks', 'Bushings' ]
            },
            {
                item: '3 Differences',
                checks: [ 'Torsion Bars Sec Mount', 'Damage', 'Air Bag Mounts Sec Mount', 'Damage', 'Air Bag Damage', 'Leaking' ]
            },
        ]
    },  // end of block
    {
        title: 'Rear Axle Brakes',
        items: [
            {
                item: 'Same as Front',
                checks: [ 'Hoses & Fittings', 'Chambers & Clamps', 'Drums & Linings', 'Slack Adjusters & Pushrods' ]
            },
        ]
    },  // end of block
    {
        title: 'Trailer Inspection',
        items: [
            {
                item: 'Front Wall',
                checks: [ 'Cracks', 'Bulges', 'Holes', 'Rivets', 'Strong', 'Lights Damage/Missing' ]
            },
            {
                item: 'Landing Gear',
                checks: [ 'Sec Mount', 'Missing Part', 'Raised', 'Frame/Pad Damage', 'Handle' ]
            },
            {
                item: 'Frame, Floor',
                checks: [ 'Sec Mount', 'Bent', 'Broke', 'Cracked', 'Missing', 'Holes' ]
            },
            {
                item: 'Side',
                checks: [ 'Broken', 'Cracked', 'Damage', 'Holes', 'Rivets' ]
            },
            {
                item: 'Reflective Tape',
                checks: [ 'Secure', 'Clean', 'Damage', 'Missing', 'Color' ]
            },
            {
                item: 'ABS',
                checks: [ 'Clean', 'Damage', 'Missing', 'Amber Color' ]
            },
        ]
    },  // end of block
    {
        title: 'Trailer Tires & Rims',
        items: [
            {
                item: 'Same as Drive Axle',
                checks: [ 'Tires', 'Rims', 'Valves', 'Valve Stems', 'Bolt Holes', 'Lug', 'Budd Spacers' ]
            },
            {
                item: 'Hub Oil Seal',
                checks: [ 'Same as Steer Tires' ]
            },
        ]
    },  // end of block
    {
        title: 'Trailer Axle Suspension',
        items: [
            {
                item: 'Same as Drive Axle',
                checks: [ 'Leaf Spring Mounts', 'Brackets', 'Leaf Springs', 'Hangers', 'Bushings', 'U-Bolts', 'Shocks', 'Bushings', 'Air Bags', 'Torque Arm' ]
            },
        ]
    },  // end of block
    {
        title: 'Trailer Axle Brakes',
        items: [
            {
                item: 'Same as Front',
                checks: [ 'Hoses & Fittings', 'Chambers & Clamps', 'Drums & Linings', 'Slack Adjusters & Pushrods' ]
            },
        ]
    },  // end of block
    {
        title: 'Back of Trailer',
        items: [
            {
                item: 'Doors',
                checks: [' Door/Hinge Damage', 'Open', 'Close', 'Latch' ]
            },
            {
                item: 'Tape',
                checks: [ 'Secure', 'Clean', 'Damage', 'Missing', 'Color' ]
            },
            {
                item: 'Lights',
                checks: [ 'Clearance', 'Signal', 'Brake', 'Sec Mount', 'Clean', 'Damage', 'Missing', 'Color Red' ]
            },
            {
                item: 'Mud Flaps',
                checks: [ 'Sec Mount', 'Damage' ]
            },
        ]
    },  // end of block
    {
        title: 'Right Side of Trailer',
        items: [
            {
                item: 'Side',
                checks: [ 'Same as other side except Exhaust' ]
            },
            {
                item: 'Exhaust',
                checks: [ 'Sec Mount', 'Loose/Missing Clamps', 'Damage', 'Cracks', 'Holes', 'Severe Dents', 'Leaks', 'Rust', 'Soot' ]
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
    test1_preTrip_A_outcab
}