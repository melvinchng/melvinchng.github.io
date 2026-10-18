const XLSX = require('xlsx');

// Sample survey data with proper question prefixes
// Demographic questions use D prefix, survey questions use Q prefix
const data = [
  {
    'D1_Gender': 'Male',
    'D2_Age Group': '18-24',
    'D3_Education': 'High School',
    'Q1_Satisfaction': 'Very Satisfied',
    'Q2_Would Recommend': 'Yes',
    'Q3_Product Rating': '5'
  },
  {
    'D1_Gender': 'Female',
    'D2_Age Group': '25-34',
    'D3_Education': 'Bachelor',
    'Q1_Satisfaction': 'Satisfied',
    'Q2_Would Recommend': 'Yes',
    'Q3_Product Rating': '4'
  },
  {
    'D1_Gender': 'Male',
    'D2_Age Group': '35-44',
    'D3_Education': 'Master',
    'Q1_Satisfaction': 'Neutral',
    'Q2_Would Recommend': 'No',
    'Q3_Product Rating': '3'
  },
  {
    'D1_Gender': 'Female',
    'D2_Age Group': '18-24',
    'D3_Education': 'Bachelor',
    'Q1_Satisfaction': 'Very Satisfied',
    'Q2_Would Recommend': 'Yes',
    'Q3_Product Rating': '5'
  },
  {
    'D1_Gender': 'Male',
    'D2_Age Group': '25-34',
    'D3_Education': 'High School',
    'Q1_Satisfaction': 'Dissatisfied',
    'Q2_Would Recommend': 'No',
    'Q3_Product Rating': '2'
  },
  {
    'D1_Gender': 'Female',
    'D2_Age Group': '45-54',
    'D3_Education': 'PhD',
    'Q1_Satisfaction': 'Satisfied',
    'Q2_Would Recommend': 'Yes',
    'Q3_Product Rating': '4'
  },
  {
    'D1_Gender': 'Male',
    'D2_Age Group': '18-24',
    'D3_Education': 'Bachelor',
    'Q1_Satisfaction': 'Satisfied',
    'Q2_Would Recommend': 'Yes',
    'Q3_Product Rating': '4'
  },
  {
    'D1_Gender': 'Female',
    'D2_Age Group': '35-44',
    'D3_Education': 'Master',
    'Q1_Satisfaction': 'Very Satisfied',
    'Q2_Would Recommend': 'Yes',
    'Q3_Product Rating': '5'
  },
  {
    'D1_Gender': 'Male',
    'D2_Age Group': '25-34',
    'D3_Education': 'Bachelor',
    'Q1_Satisfaction': 'Neutral',
    'Q2_Would Recommend': 'Maybe',
    'Q3_Product Rating': '3'
  },
  {
    'D1_Gender': 'Female',
    'D2_Age Group': '18-24',
    'D3_Education': 'High School',
    'Q1_Satisfaction': 'Dissatisfied',
    'Q2_Would Recommend': 'No',
    'Q3_Product Rating': '2'
  },
  {
    'D1_Gender': 'Male',
    'D2_Age Group': '45-54',
    'D3_Education': 'PhD',
    'Q1_Satisfaction': 'Very Satisfied',
    'Q2_Would Recommend': 'Yes',
    'Q3_Product Rating': '5'
  },
  {
    'D1_Gender': 'Female',
    'D2_Age Group': '25-34',
    'D3_Education': 'Master',
    'Q1_Satisfaction': 'Satisfied',
    'Q2_Would Recommend': 'Yes',
    'Q3_Product Rating': '4'
  },
  {
    'D1_Gender': 'Male',
    'D2_Age Group': '35-44',
    'D3_Education': 'Bachelor',
    'Q1_Satisfaction': 'Neutral',
    'Q2_Would Recommend': 'Maybe',
    'Q3_Product Rating': '3'
  },
  {
    'D1_Gender': 'Female',
    'D2_Age Group': '18-24',
    'D3_Education': 'Bachelor',
    'Q1_Satisfaction': 'Very Satisfied',
    'Q2_Would Recommend': 'Yes',
    'Q3_Product Rating': '5'
  },
  {
    'D1_Gender': 'Male',
    'D2_Age Group': '25-34',
    'D3_Education': 'High School',
    'Q1_Satisfaction': 'Dissatisfied',
    'Q2_Would Recommend': 'No',
    'Q3_Product Rating': '2'
  }
];

// Create workbook
const wb = XLSX.utils.book_new();
const ws = XLSX.utils.json_to_sheet(data);

// Add worksheet to workbook
XLSX.utils.book_append_sheet(wb, ws, 'Survey Data');

// Write file
XLSX.writeFile(wb, 'sample_survey_data.xlsx');

console.log('Sample Excel file generated: sample_survey_data.xlsx');
