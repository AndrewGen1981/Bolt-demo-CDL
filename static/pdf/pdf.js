
function form1ToPDF(form1Obj) {
    // console.log(form1Obj)

    return {
	
        info: {
            title:'STUDENT ENROLLMENT FORMs',
            author:'TTA Team',
            subject:'DATA COLLECTION FORM'
        },
        
        pageSize:'letter',
        pageOrientation:'portrait', //'landscape'
        pageMargins:[50,50,30,30],  // left, top, right, bottom
        
        header:[
            {
                text: 'Toro Trucking Academy'.toUpperCase(),
                alignment: 'right',
                margin:[0,30,30,50]
            }
        ],
        
        footer:[
            {
                text:'TTA Electronic Document Management',
                alignment:'center',//left  right
            }
        ],
        
        content: [
            {
                text: 'STUDENT DATA COLLECTION FORM',  fontSize:20
            },
            {
                text: 'The Workforce Board (the state agency that regulates this school) requires that we ask you for this information, by law (RCW 28C.10.050). Providing your social security number is voluntary. By law, the information you provide on this form cannot be given out by any state agency as public information. The Workforce Board will not disclose data to anyone except authorized Workforce Board employees or contractors working on specific research activities, who follow strict confidentiality procedures. This format follows the information required to be submitted by the school as part of the annual student data report.',
                fontSize: 10
            },
            {
                text: `signed by Applicant: ${new Date(form1Obj.created).toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })}`,
                alignment:'right',
                italics: true,
                fontSize:12
            },
            { text: '.', fontSize: 10,  alignment:'right' },
            {
                text: `Last Name: ${form1Obj.lastName.toUpperCase()}`,
                fontSize:16
            },
            {
                text: `First Name: ${form1Obj.firstName.toUpperCase()}`,
                fontSize:16
            },
            {
                text: `Middle Name: ${form1Obj.middleName.toUpperCase()}`,
                fontSize:16
            },
            { text: '.', fontSize: 10,  alignment:'right' },
            {
                text: 'Address: '+`${form1Obj.street} ${form1Obj.city}, ${form1Obj.state}, ${form1Obj.zip}`.toUpperCase(),
                italics: true,
                fontSize:14
            },
            {
                ul: [
                    {
                        text: `email: ${form1Obj.email}`,
                        bold: true
                    },
                    `phone: ${form1Obj.phone}`,
                    `date of birth: ${new Date(form1Obj.DOB).toLocaleDateString('en-US', { timeZone: 'America/Los_Angeles' })}`,
                    `SSN: ${form1Obj.SSN}`
                ],
                fontSize:14
            },
            { text: '.', fontSize: 10,  alignment:'right' },
            {
                text: `Race (checked value): ${form1Obj.race.toUpperCase()}`,
                fontSize: 14
            },
            {
                ul: [
                    'White/Caucasian',
                    'Black/African American',
                    'American Indian or Alaska Native',
                    'Hawaiian Native or other Pacific Islander',
                    'Asian',
                    'Multiracial',
                    'Other'
                ],
                fontSize:9
            },

            {
                text: `Are you Hispanic in origin?: ${form1Obj.hispanic.toUpperCase()}`,
                fontSize: 14
            },
            {
                text: `*Hispanic defined as a person of Mexican, Puerto Rican, Cuban, Central or South American, or other Spanish culture or origin, regardless of race.`,
                fontSize: 9
            },

            {
                text: `Are you disabled?: ${form1Obj.disabled.toUpperCase()}`,
                fontSize: 14
            },
            {
                text: `*Disability defined as a physical or mental impairment which substantially limits one or more major life activities, such as seeing, hearing, speaking, walking, learning, working, etc.`,
                fontSize: 9
            },

            {
                text: `Are you a military veteran?: ${form1Obj.veteran.toUpperCase()}`,
                fontSize: 14
            },
            {
                text: `*Veteran defined as a student that served, in not currently serving, on active duty in the U.S. Army, Navy, Air Force, Marine Corps, or Coast Guard.`,
                fontSize: 9
            },

            {
                text: `Gender: ${form1Obj.sex.toUpperCase()}`,
                fontSize: 14
            },

            {
                text: `Highest grade completed: ${form1Obj.grade.toUpperCase()}`,
                fontSize: 14
            },
            {
                ul: [
                    'Less than high school graduation',
                    'High school graduate',
                    'GED',
                    'Some post high school, no degree/certificate',
                    'Certificate (less than 2 years)',
                    'Associate degree',
                    'Bachelors degree',
                    'Masters degree or higher'
                ],
                fontSize:9
            },
            { text: '.', fontSize: 10,  alignment:'right' },
            {
                text: 'Applicant Signature _____________________',
                italics: true,
                fontSize: 14
            }
        ]

    }

}



module.exports = {
    form1ToPDF
}