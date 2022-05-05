const test2_backing = [
    {
        title: 'Straight Line Backing',
        items: [
            {
                item: 'Pull-Ups',
                checks: [ '0', '1', '1', '1', '1', '1', '1', '1' ]
            },
            {
                item: 'Encroachment',
                checks: [ '2', '2', '2', '2', '2', '2' ]
            },
            {
                item: 'Get-Out-And Look (GOAL)',
                checks: [ '0', '1', '1', '1', '1', '1' ]
            },
            {
                item: 'Final Position',
                checks: [ '0', '10' ]
            },
            {
                item: 'Total Fail',
                checks: [ '100' ]
            },
        ]
    },  // end of block
    {
        title: 'Offset Backing',
        items: [
            {
                item: 'Pull-Ups',
                checks: [ '0', '0', '1', '1', '1', '1', '1', '1' ]
            },
            {
                item: 'Encroachment',
                checks: [ '2', '2', '2', '2', '2', '2' ]
            },
            {
                item: 'Get-Out-And Look (GOAL)',
                checks: [ '0', '0', '1', '1', '1', '1' ]
            },
            {
                item: 'Final Position',
                checks: [ '0', '10' ]
            },
            {
                item: 'Total Fail',
                checks: [ '100' ]
            },
        ]
    },  // end of block
    {
        title: 'Alley Dock Backing',
        items: [
            {
                item: 'Pull-Ups',
                checks: [ '0', '0', '1', '1', '1', '1', '1', '1' ]
            },
            {
                item: 'Encroachment',
                checks: [ '2', '2', '2', '2', '2', '2' ]
            },
            {
                item: 'Get-Out-And Look (GOAL)',
                checks: [ '0', '0', '1', '1', '1', '1' ]
            },
            {
                item: 'Final Position',
                checks: [ '0', '10' ]
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
    test2_backing
}