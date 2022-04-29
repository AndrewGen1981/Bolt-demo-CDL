const test1_preTrip_B_incab = [
    {
        // 'important' flag means that if at least 1 fail, then all test is fail
        title: 'General',
        items: [
            {
                item: 'Safety Start',
                checks: ['Brakes', 'Neutral', 'Clutch', 'ABS Light'],
            },
            {
                item: 'Building Air',
                checks: ['120-140 Gov should cutout', 'Notes Gov cutout'],
                important: true
            },
            {
                item: 'Three Air Checks',
                checks: ['Place in gear', 'Key Off', 'Key On', 'Brakes Released', 'Wheel Chocks'],
                important: true
            },
            {
                item: 'Air Leak Check',
                checks: ['>3 PSI', '1 Minute', 'Air needle stabilized', 'Time starts/ends now', 'Notes Result'],
                important: true
            },
            {
                item: 'Low Air Warning',
                checks: ['AT or ABOVE 60 PSI', 'Notes Result'],
                important: true
            },
            {
                item: 'Protection Valves',
                checks: ['Approximately 40 PSI', 'Notes results']
            },
            {
                item: 'Safety Start #2',
                checks: ['Brakes Set', 'Neutral', 'Clutch In', 'ABS Light #2']
            },
            {
                item: 'Seat Belt',
                checks: ['Securely Mounted', 'Works Properly', 'Cut', 'Frayed'],
            },
            {
                item: 'Emergency EQ',
                checks: ['Triangles', 'Fuses']
            },
            {
                item: 'Fire Extinguisher',
                checks: ['Secure', 'Full Charged', 'Up to date', 'First Aid & Bodily Fluid Cleanup Kits']
            },
        ]
    },  // end of block
    {
        title: 'Dashboard Check',
        items: [
            {
                item: 'Dashboard',
                checks: ['Oil Pressure', 'Temperature', 'Left signal', 'Right signal', '4-Ways', 'High beams', 'Heater', 'Defroster', 'Horn(s)']
            },
            {
                item: 'Volt/Ammeter',
                checks: [ 'charging' ]
            },
        ]
    },  // end of block
    {
        title: 'Other Checks',
        items: [
            {
                item: 'Wiper/Washer',
                checks: ['Securely Mounted', 'Not Damaged', 'Working Smoothly']
            },
            {
                item: 'Windshield, Windows, Mirrors',
                checks: ['Securely Mounted', 'Cracked', 'Chipped', 'Damaged', 'Clean', 'Nothing is blocking view', 'Mirrors adjusted to me']
            },
            {
                item: 'Brake Check',
                checks: ['Parking Brake Check', 'Service Brake Check']
            },
            {
                item: 'Entry Door',
                checks: ['Hinges', 'Damaged', 'Operates Smoothly', 'Close Securely', 'Hand Rails Secure', 'Step Light Working']
            },
            {
                item: 'Entry Steps',
                checks: ['Clear', 'Tread not Loose or Worn']
            },
            {
                item: 'Handicap Lift',
                checks: ['Leaking, Damaged Missing Parts', 'Check for correct operation', 'Lift fully retracted, latched securely']
            },
            {
                item: 'Seating',
                checks: ['No broken frames', 'Attached to floor', 'Cushions secure']
            },
            {
                item: 'Baggage/Compartment Doors',
                checks: ['Not damaged', 'Operate properly', 'Latched securely']
            },
            {
                item: 'Emergency Exits',
                checks: ['Demonstrate One', 'Mentions others', 'Operates smoothly from inside and outside', 'Closes securely', 'Damaged', 'Warning devices working']
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
    test1_preTrip_B_incab
}