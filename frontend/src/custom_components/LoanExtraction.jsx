import { useState } from "react";
import Button from "../components/Button";
import UploadedModel from "./UploadedModel";
import LoanPackagePanel from "./LoanPackagePanel";
import DescriptionIcon from "@mui/icons-material/Description";
import UnderwritingRulesModel from "./UnderwritingRulesModel";
import UnuploadedScreen from "./UnuploadedScreen";

import { useUpload } from "../context/UploadContext";

const LoanExatraction = ({ showSection = {}, setShowSection = () => {} }) => {
  const { isUploaded, setIsUploaded } = useUpload();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [rulesModel, setRulesModel] = useState(false);
  const rawData = {
    "Samuel C Sotello": {
      "Bank Statement": [
        {
          "Borrower Name": "SAMUEL C SOTELLO, GLYNDA SOTELLO",
          "Account Holder Address": "1720 TESSMAN RD, PLEASANTON TX 78064",
          "Account Holder Name": "SAMUEL C SOTELLO, GLYNDA SOTELLO",
          "Bank Name": "PROSPERITY BANK",
          "Income Source": "N/A",
          "Account Number": "3342",
          "Account Category": "Personal",
          "Account Type": "Savings",
          "Bank Name/Account Number": "PROSPERITY BANK/3342",
          "End date": "30-04-2025",
          "Beginning Balance": "$24,794.15",
          "Ending Balance": "$18,630.15",
          "NSF Count": "0",
          "NSF & Overdraft fees": "$0.00",
          "Deposit Count": "0",
          "Deposit Sum": "$0.00",
          Title:
            "1-Asset- Bank Statement ~ IC_LOAN_50490 1501581799_0S2YHTK5RUF4GIGJEW9MG4B1_DCA_430.pdf",
          Url: "https://cabmststr001.blob.core.windows.net/filedrive/9afeff4bd42ac821ffc50a379a43bfee?time=638916269554698801",
          StageName: "Exported",
          GeneratedOn: "2025-08-24T10:32:05.7139404Z",
        },
        {
          "Borrower Name": "SAMUEL GLYNDA SOTELLO CAMERON SOTELLO",
          "Account Holder Address": "1720 TESSMAN TX RD 78064-1802",
          "Account Holder Name": "SAMUEL GLYNDA SOTELLO CAMERON SOTELLO",
          "Bank Name": "SouthTrustBank",
          "Income Source": "N/A",
          "Account Number": "884809",
          "Account Category": "Personal",
          "Account Type": "Savings",
          "Bank Name/Account Number": "SouthTrustBank 884809",
          "End date": "30-04-2025",
          "Beginning Balance": "$5,591.91",
          "Ending Balance": "$48,616.69",
          "NSF Count": "N/A",
          "NSF & Overdraft fees": "N/A",
          "Deposit Count": "1",
          "Deposit Sum": "$5,582.00",
          Title:
            "2-Asset- Bank Statement ~ IC_LOAN_50490 1501581799_0S2YHTK5RUF4GIGJEW9MG4B1_DCA_430.pdf",
          Url: "https://cabmststr001.blob.core.windows.net/filedrive/2bc2a5fabe240821b625f76212859aa3?time=638916269554698725",
          StageName: "Exported",
          GeneratedOn: "2025-08-24T10:32:05.7962259Z",
        },
      ],
      W2: [
        {
          Year: "2023",
          "Employee Social Security Number": "1844",
          "Employer ID No. (EIN": "85-0661615",
          "Wages Tips Other Comp": "95920.00",
          "Federal Income Tax Withheld": "15433.84",
          "Social Security Wages": "95920.00",
          "Social Security Tax Withheld": "5947.04",
          "Medicare Wages And Tips": "95920.00",
          "Medicare Tax Withheld": "1390.84",
          "Employer Name": "Sotello Electric LLC",
          "Employer Address 1": "P.O. Box 103",
          "Employer Address 2": "n/A",
          "Employer Address City": "Pleasanton",
          "Employer Address State": "TX",
          "Employer Address Zip Code": "78064",
          "Employee Name": "Samuel C Sotello",
          "Employee Address 1": "1720 Tessman Rd",
          "Employee Address 2": "n/A",
          "Employee Address City": "Pleasanton",
          "Employee Address State": "TX",
          "Employee Address Zip Code": "78064",
          "Social Security Tips": "n/A",
          "Allocated Tips": "n/A",
          "Dependent Care Benefits": "n/A",
          "Nonqualified Plans": "n/A",
          "Code Description 1": "n/A",
          "Code Amount 1": "n/A",
          "Code Description 2": "n/A",
          "Code Amount 2": "n/A",
          "Code Description 3": "n/A",
          "Code Amount 3": "n/A",
          "Code Description 4": "n/A",
          "Code Amount 4": "n/A",
          "Statutory Employee": "Unchecked",
          "Retirement Plan": "Unchecked",
          "Third-Party Sick Pay": "Unchecked",
          "State Primary": "n/A",
          "State Secondary": "n/A",
          "Employer state ID Number Primary": "n/A",
          "Employer state ID Number Secondary": "n/A",
          "State Wages Tips Primary": "n/A",
          "State Wages Tips Secondary": "n/A",
          "State Income Tax Primary": "n/A",
          "State Income Tax Secondary": "n/A",
          "Local Wages Tips Primary": "n/A",
          "Local Wages Tips Secondary": "n/A",
          "Local Income Tax Primary": "n/A",
          "Local Income Tax Secondary": "n/A",
          "Locality Name Primary": "n/A",
          "Locality Name Secondary": "n/A",
          Title:
            "1-Income- W2 ~ IC_LOAN_50490 1501581799_0S2YHTK5RUF4GIGJEW9MG4B1_DCA_430.pdf",
          Url: "https://cabmststr001.blob.core.windows.net/filedrive/9c9bcee09dbd6e0268137eb6f176dde4?time=638916269554698663",
          StageName: "Exported",
          GeneratedOn: "2025-08-24T10:32:17.6625278Z",
        },
        {
          Year: "2024",
          "Employee Social Security Number": "1844",
          "Employer ID No. (EIN": "85-0661615",
          "Wages Tips Other Comp": "95674.00",
          "Federal Income Tax Withheld": "14837.90",
          "Social Security Wages": "95674.00",
          "Social Security Tax Withheld": "5931.81",
          "Medicare Wages And Tips": "95674.00",
          "Medicare Tax Withheld": "1386.72",
          "Employer Name": "Sotello Electric LLC",
          "Employer Address 1": "P.O. Box 103",
          "Employer Address 2": "n/A",
          "Employer Address City": "Pleasanton",
          "Employer Address State": "TX",
          "Employer Address Zip Code": "78064",
          "Employee Name": "Samuel C Sotello",
          "Employee Address 1": "1720 Tessman Rd",
          "Employee Address 2": "n/A",
          "Employee Address City": "Pleasanton",
          "Employee Address State": "TX",
          "Employee Address Zip Code": "78064",
          "Social Security Tips": "n/A",
          "Allocated Tips": "n/A",
          "Dependent Care Benefits": "n/A",
          "Nonqualified Plans": "n/A",
          "Code Description 1": "n/A",
          "Code Amount 1": "n/A",
          "Code Description 2": "n/A",
          "Code Amount 2": "n/A",
          "Code Description 3": "n/A",
          "Code Amount 3": "n/A",
          "Code Description 4": "n/A",
          "Code Amount 4": "n/A",
          "Statutory Employee": "Unchecked",
          "Retirement Plan": "Unchecked",
          "Third-Party Sick Pay": "Unchecked",
          "State Primary": "n/A",
          "State Secondary": "n/A",
          "Employer state ID Number Primary": "n/A",
          "Employer state ID Number Secondary": "n/A",
          "State Wages Tips Primary": "n/A",
          "State Wages Tips Secondary": "n/A",
          "State Income Tax Primary": "n/A",
          "State Income Tax Secondary": "n/A",
          "Local Wages Tips Primary": "n/A",
          "Local Wages Tips Secondary": "n/A",
          "Local Income Tax Primary": "n/A",
          "Local Income Tax Secondary": "n/A",
          "Locality Name Primary": "n/A",
          "Locality Name Secondary": "n/A",
          Title:
            "2-Income- W2 ~ IC_LOAN_50490 1501581799_0S2YHTK5RUF4GIGJEW9MG4B1_DCA_430.pdf",
          Url: "https://cabmststr001.blob.core.windows.net/filedrive/a8f0facd1e57a6daef5395f8506d1ab3?time=638916269554698587",
          StageName: "Exported",
          GeneratedOn: "2025-08-24T10:32:11.5749977Z",
        },
      ],
      "Form 4797": [
        {
          Year: "2023",
          "Beginning Date Of Tax Year": "Jan 1",
          "Ending Date Of Tax Year": "Dec 31",
          "Your First Name And Middle Initial": "Roger D",
          "Last Name": "Harrison",
          "Your Social Security Number": "639-32-1844",
          "Home Address 1": "N/A",
          "Home Address City": "N/A",
          "Home Address State": "N/A",
          "Home Address Zip Code": "N/A",
          "Presidential Election Campaign You": "0",
          "Presidential Election Campaign Spouse": "0",
          "Filing Status Single": "0",
          "Filing Status Married filing jointly (even if only one had income)":
            "0",
          "Filing Status Married filing separately (MFS)": "0",
          "Filing Status Head of household (HOH)": "0",
          "Filing Status Qualifying surviving spouse (QSS)": "0",
          "At Any Time During 2023 Did You Receive Sell Exchange Yes": "N/A",
          "At Any Time During 2023 Did You Receive Sell Exchange No": "N/A",
          "Someone Can Claim You as a dependent": "N/A",
          "Someone Can Claim Your spouse as a dependent": "N/A",
          "Spouse Itemizes On A Separate Return Or You Were A Dual Status Alien":
            "N/A",
          "Age/Blindness You Were born before January 2, 1959": "N/A",
          "Age/Blindness You Are blind": "N/A",
          "Age/Blindness Spouse Was born before January 2, 1959": "N/A",
          "Spouse Is blind": "N/A",
          "If More Than Four Dependents": "N/A",
          "Total Amount From Form(s) W2 Box 1": "N/A",
          "Add Lines 1a Through 1h Income": "N/A",
          "Tax Exempt Interest": "N/A",
          "Taxable Interest": "N/A",
          "Qualified Dividends": "N/A",
          "Add Lines 1Z 2B 3B 4B 5B 6B 7 And 8. This is your total income.":
            "N/A",
          "Adjustments To Income From Schedule 1 Line 26": "N/A",
          "Subtract Line 10 From Line 9 This Is Your Adjusted Gross Income":
            "N/A",
          "Standard Deduction Or Itemized Deductions": "N/A",
          "Add Lines 12 And 13 Deductions": "N/A",
          "Subtract Line 14 From Line 11": "N/A",
          "Add Lines 22 And 23. This Is Your Total Tax This is your total tax.":
            "N/A",
          "If Joint Return Spouse's First Name And Middle Initial": "N/A",
          "Spouse's Last Name": "N/A",
          "Spouse's Social Security Number": "N/A",
          "Home Address 2": "N/A",
          "Foreign Country Name": "N/A",
          "Foreign Province/State/County": "N/A",
          "Foreign Postal Code": "N/A",
          "If You Checked The MFS Box Enter The Name Of Your Spouse. If You Checked The HOH Or QSS":
            "N/A",
          "Dependents (Line 1) First Name": "N/A",
          "Dependents (Line 1) Last Name": "N/A",
          "Dependents (Line 1) Social Security Number": "N/A",
          "Dependents (Line 1) Relationship to you": "N/A",
          "Dependents (Line 1) Check the box if qualifies for Child Tax Credit":
            "N/A",
          "Dependents (Line 1) Check the box if qualifies for Credit for other dependents":
            "N/A",
          "Dependents (Line 2) First Name": "N/A",
          "Dependents (Line 2) Last Name": "N/A",
          "Dependents (Line 2) Social Security Number": "N/A",
          "Dependents (Line 2) Relationship to you": "N/A",
          "Dependents (Line 2) Check the box if qualifies for Child Tax Credit":
            "N/A",
          "Dependents (Line 2) Check the box if qualifies for Credit for other dependents":
            "N/A",
          "Dependents (Line 3) First Name": "N/A",
          "Dependents (Line 3) Last Name": "N/A",
          "Dependents (Line 3) Social Security Number": "N/A",
          "Dependents (Line 3) Relationship to you": "N/A",
          "Dependents (Line 3) Check the box if qualifies for Child Tax Credit":
            "N/A",
          "Dependents (Line 3) Check the box if qualifies for Credit for other dependents":
            "N/A",
          "Dependents (Line 4) First Name": "N/A",
          "Dependents (Line 4) Last Name": "N/A",
          "Dependents (Line 4) Social Security Number": "N/A",
          "Dependents (Line 4) Relationship to you": "N/A",
          "Dependents (Line 4) Check the box if qualifies for Child Tax Credit":
            "N/A",
          "Dependents (Line 4) Check the box if qualifies for Credit for other dependents":
            "N/A",
          "Household Employee Wages Not Reported On Form(s) W2": "N/A",
          "Tip Income Not Reported On Line 1a": "N/A",
          "Medicaid Waiver Payments Not Reported On Form(s) W2": "N/A",
          "Taxable Dependent Care Benefits From Form 2441 Line 26": "N/A",
          "Employer Provided Adoption Benefits From Form 8839 Line 29": "N/A",
          "Wages From Form 8919 Line 6": "N/A",
          "Other Earned Income": "N/A",
          "Nontaxable Combat Pay Election": "N/A",
          "Ordinary Dividends": "N/A",
          "IRA Distributions": "N/A",
          "IRA Distributions Taxable Amount": "N/A",
          "Pensions And Annuities": "N/A",
          "Pension and Annuities Taxable Amount": "N/A",
          "Social Security Benefits": "N/A",
          "Social Security Benefits Taxable Amount": "N/A",
          "If You Elect To Use The Lump Sum Election Method Check Here": "N/A",
          "Capital Gain Or (Loss) Amount": "N/A",
          "Capital Gain Or (Loss) Checkbox": "N/A",
          "Additional Income From Schedule 1 Line 10": "N/A",
          "Qualified Business Income Deduction From Form 8995 Or Form 8995 A":
            "N/A",
          "Tax Check If Any From Form(s) 1 - 8814": "0",
          "Tax Check If Any From Form(s) 2 - 4972": "0",
          "Tax Check If Any From Form(s) 3 - Checkbox": "0",
          "Tax Check If Any From Form(s) 3 - Text": "N/A",
          "Tax Check If Any From Form(s)": "N/A",
          "Amount From Schedule 2 Line 3": "N/A",
          "Add Lines 16 And 17 Tax": "N/A",
          "Child Tax Credit Or Credit For Other Dependents From Schedule 8812":
            "N/A",
          "Amount From Schedule 3 Line 8": "N/A",
          "Add Lines 19 And 20 Child Tax Credit and Amount from Schedule 3":
            "N/A",
          "Subtract Line 21 From Line 18 If Zero Or Less Enter 0": "N/A",
          "Other Taxes Including Self Employment Tax From Schedule 2 Line 21":
            "N/A",
          "Federal Income Tax Withheld From Form(s) W": "N/A",
          "Federal Income Tax Withheld From Form(s) 1099": "N/A",
          "Federal Income Tax Withheld From Other Forms (See Instructions)":
            "N/A",
          "Federal Income Tax Withheld From Add Lines 25A Through 25C": "N/A",
          "2023 Estimated Tax Payments And Amount Applied From 2022 Return":
            "N/A",
          "Earned Income Credit (EIC)": "N/A",
          "Additional Child Tax Credit From Schedule 8812": "N/A",
          "American Opportunity Credit From Form 8863 Line 8": "N/A",
          "Reserved for future use": "n/a",
          "Amount From Schedule 3 Line 15": "N/A",
          "Add Lines 27 28 29 And 31. These Are Your Total Other Payments And Refundable":
            "N/A",
          "Add Lines 25D 26 And 32. These Are Your Total Payments": "N/A",
          "If Line 33 Is More Than Line 24 Subtract Line 24 From Line 33":
            "N/A",
          "Amount Of Line 34 You Want Refunded To You Amount": "N/A",
          "If Form 8888 Is Attached Check Here Checkbox": "1",
          "Routing Number": "11419708",
          "Type Checking": "1",
          "Type Savings": "0",
          "Account Number": "884809",
          "Amount Of Line 34 You Want Applied To Your 2024 Estimated Tax":
            "N/A",
          "Subtract Line 33 From Line 24. This is The Amount You Owe": "N/A",
          "Estimated Tax Penalty": "N/A",
          "Do You Want To Allow Another Person To Discuss This Return With IRS? Yes":
            "1",
          "Do You Want To Allow Another Person To Discuss This Return With IRS? No":
            "0",
          "Designee's Name": "Roger D Harrison",
          "Designee Phone No.": "210 710-7523",
          "Designee Personal Identification Number (PIN)": "65076",
          "Sign Here Your Signature": "signed",
          "Sign Here Date": "4/2/2024",
          "Your Occupation": "N/A",
          "If The IRS Sent You An Identity Protection PIN Enter It Here": "N/A",
          "Spouse's Signature": "N/A",
          "Spouse's Date": "N/A",
          "Spouse's Occupation": "N/A",
          "If The IRS Sent Your Spouse An Identity Protection PIN Enter It Here":
            "N/A",
          "Sign Here Phone No.": "N/A",
          "Sign Here Email Address": "N/A",
          "Preparer's Name": "Roger D Harrison",
          "Preparer's Signature": "Roger D Harrison",
          "Paid Preparer Use Only Date": "4/9/2024",
          "Paid Preparer Use Only PTIN": "P01217238",
          "Paid Preparer Use Only Check If Self-employed": "1",
          "Paid Preparer Use Only Firm's Name": "R D Harrison CPA",
          "Paid Preparer Use Only Firm's Address 1": "PO Box 2785",
          "Paid Preparer Use Only Firm's Address 2": "N/A",
          "Paid Preparer Use Only Firm's Address City": "Grapevine",
          "Paid Preparer Use Only Firm's Address State": "TX",
          "Paid Preparer Use Only Firm's Address Zip Code": "76099-2785",
          "Paid Preparer Use Only Phone No.": "210 710-7523",
          "Firm's EIN": "74-2999811",
          "Name(s) Shown On Return": "Samuel C Sotello",
          "Identifying Number": "639-32-1844",
          "Borrower Name": "Samuel C Sotello",
          Field: "Samuel C Sotello",
          "Name Of Proprietor": "Samuel C Sotello",
          "Social Security Number (SSN)": "1844",
          "Principal Crop Or Activity": "Cattle",
          "Enter Code From Part IV": "112111",
          "Accounting Method Cash": "1",
          "Accounting Method Accrual": "0",
          "Employer ID Number (EIN)": "n/A",
          "Did You Materially Participate In The Operation Of This Business During 2023? Yes":
            "1",
          "Did You Materially Participate In The Operation Of This Business During 2023? No":
            "0",
          "Did You Make Any Payments In 2023 That Would Require You To File Form(s) 1099? Yes":
            "1",
          "Did You Make Any Payments In 2023 That Would Require You To File Form(s) 1099? No":
            "0",
          "If Yes Did You Or Will You File Required Form(s) 1099? Yes": "1",
          "If Yes Did You Or Will You File Required Form(s) 1099? No": "0",
          "Sales Of Purchased Livestock And Other Resale Items": "n/A",
          "Cost Or Other Basis Of Purchased Livestock Or Other Items Reported On Line 1A":
            "n/A",
          "Subtract Line 1B From Line 1A": "n/A",
          "Sales Of Livestock Produce Grains And Other Products You Raised":
            "25,159",
          "Cash Method Cooperative Distributions (Form(s) 1099": "n/A",
          "Cash Method Cooperative Distributions Taxable Amount": "n/A",
          "Cash Method Agricultural Program Payments": "n/A",
          "Cash Method Agricultural Program Payments Taxable Amount": "n/A",
          "Commodity Credit Corporation (CCC) Loans Reported Under Election":
            "n/A",
          "CCC Loans Forfeited": "n/A",
          "Cash Method CCC Loans Forfeited Taxable Amount": "n/A",
          "Crop Insurance Proceeds And Federal Crop Disaster Payments Amount received in Year":
            "n/A",
          "Taxable Amount": "n/A",
          "Amount deferred from Year": "n/A",
          "Cash Method Custom Hire (Machine Work) Income": "n/A",
          "Other Income Including Federal And State Gasoline Or Fuel Tax Credit Or Refund":
            "n/A",
          "Cash Method Gross Income": "25,159",
          "Car And Truck Expenses": "n/A",
          Chemicals: "n/A",
          "Conservation Expenses": "n/A",
          "Custom Hire (Machine Work)": "n/A",
          "Depreciation And Section 179 Expense": "4,788",
          "Employee Benefit Programs Other Than On Line 23": "n/A",
          Feed: "11,613",
          "Fertilizers And Lime": "n/A",
          "Freight And Trucking": "n/A",
          "Gasoline Fuel And Oil": "n/A",
          "Insurance (Other Than Health)": "3,403",
          "Interest Mortgage": "n/A",
          "Interest Other": "n/A",
          "Labor Hired (Less Employment Credits)": "272",
          "Pension And Profit Sharing Plans": "n/A",
          "Repairs And Maintenance": "702",
          "Seeds And Plants": "n/A",
          "Storage And Warehousing": "14,615",
          Supplies: "n/A",
          Taxes: "n/A",
          Utilities: "n/A",
          "Veterinary Breeding And Medicine": "448",
          "Total Expenses": "40,641",
          "Net Farm Profit Or (Loss)": "-15,482",
          "Check The Box That Describes Your Investment In This Activity: All investment is at risk":
            "1",
          "Check The Box That Describes Your Investment In This Activity: Some investment is not at risk.":
            "0",
          "Sales Of Livestock Produce Grains And Other Products": "n/A",
          "Accrual Method Cooperative Distributions (Form(s) 1099": "n/A",
          "Accrual Method Cooperative Distributions Taxable Amount": "n/A",
          "Accrual Method Agricultural Program Payments": "n/A",
          "Accrual Method CCC Loans Forfeited": "n/A",
          "Commodity Credit Corporation (CCC) Loans a CCC loans reported under election":
            "n/A",
          "Commodity Credit Corporation (CCC) Loans CCC loans forfeited": "n/A",
          "Commodity Credit Corporation (CCC) Loans Taxable amount": "n/A",
          "Crop Insurance Proceeds": "n/A",
          "Accrual Method Custom Hire (Machine Work) Income": "n/A",
          "Other Income": "n/A",
          "Add Amounts In The Right Column For Lines 37 Through 43 Farm Income Accural Method":
            "n/A",
          "Inventory Of Livestock Produce Grains And Other Products": "n/A",
          "Cost Of Livestock Produce Grains And Other Products Purchased During The Year":
            "n/A",
          "Add Lines 45 And 46 Inventory Of Live Stock and Cost of Live Stock":
            "n/A",
          "Inventory Of Livestock Produce Grains And Other Products At End Of Year":
            "n/A",
          "Cost Of Livestock Produce Grains And Other Products Sold": "n/A",
          "Accrual Method Gross Income": "n/A",
          "If election to defer to 2024 is attached": "n/A",
          "Rent or Lease Vehicle, machinery, equipment": "n/A",
          "Rent or Lease Other (land, animals, etc.)": "n/A",
          "Name(s) Shown On Form 1040 1040-SR Or 1040-NR": "Samuel C Sotello",
          "Taxable Refunds Credits Or Offsets Of State And Local Income Taxes":
            "1",
          "Alimony Received": "n/a",
          "Alimony received - Date Of Original Divorce Or Separation Agreement":
            "n/a",
          "Business Income Or (Loss) Attach Schedule C": "n/a",
          "Other Gains Or (Losses) Attach Form 4797": "n/a",
          "Rental Real Estate Royalties Partnerships S Corporations Trusts Etc. Attach Schedule E":
            "n/a",
          "Farm Income Or (Loss) Attach Schedule F": "-15,482",
          "Unemployment Compensation": "n/a",
          "Other Income Net operating loss": "n/a",
          "Other Income Gambling": "n/a",
          "Other Income Cancellation of debt": "n/a",
          "Other Income Foreign earned income exclusion from Form 2555": "n/a",
          "Other Income from Form 8853": "n/a",
          "Other Income from Form 8889": "n/a",
          "Other Income Alaska Permanent Fund dividends": "n/a",
          "Other Income Jury duty pay": "n/a",
          "Other Income Prizes and awards": "n/a",
          "Other Income Activity not engaged in for profit income": "n/a",
          "Other Income Stock options": "n/a",
          "Other Income from the rental of personal property": "n/a",
          "Other Income Olympic and Paralympic medals and USOC prize money":
            "n/a",
          "Other Income Section 951(a) inclusion": "n/a",
          "Other Income Section 951A(a) inclusion": "n/a",
          "Other Income Section 461(l) excess business loss adjustment": "n/a",
          "Other Income Taxable distributions from an ABLE account": "n/a",
          "Other Income Scholarship and fellowship grants not reported on Form W-2":
            "n/a",
          "Other Income Nontaxable amount of Medicaid waiver payments included on Form 1040 line 1a or 1d":
            "n/a",
          "Other Income Pension or annuity from a nonqualified deferred compensation plan or a nongovernment section 457 plan":
            "n/a",
          "Other Income Wages earned while incarcerated": "n/a",
          "Other Income Digital assets received as ordinary income not reported elsewhere":
            "n/a",
          "Total Other Income Add Lines 8A Through 8Z": "n/a",
          "Combine Lines 1 Through 7 And 9. This is your additional income.":
            "-15,482",
          "Educator Expenses": "n/a",
          "Certain Business Expenses Of Reservists Performing Artists and fee-basis government officials. Attach Form 2106":
            "n/a",
          "Health Savings Account Deduction. Attach Form 8889": "n/a",
          "Moving Expenses For Members Of The Armed Forces. Attach Form 3903":
            "n/a",
          "Deductible Part Of Self-Employment Tax. Attach Schedule SE": "n/a",
          "Self-Employed SEP SIMPLE And Qualified Plans": "n/a",
          "Self-Employed Health Insurance Deduction": "n/a",
          "Penalty On Early Withdrawal Of Savings": "n/a",
          "Alimony Paid": "n/a",
          "Recipient's SSN": "n/a",
          "Alimony Paid - Date Of Original Divorce Or Separation Agreement":
            "n/a",
          "IRA Deduction": "n/a",
          "Student Loan Interest Deduction": "n/a",
          "Archer MSA Deduction": "n/a",
          "Other Adjustments Jury duty pay": "n/a",
          "Other Adjustments Deductible expenses related to income reported on line 8l from the rental of personal property engaged in for profit":
            "n/a",
          "Other Adjustments Nontaxable amount of the value of Olympic and Paralympic medals and USOC prize money reported on line 8m":
            "n/a",
          "Other Adjustments Reforestation amortization and expenses": "n/a",
          "Other Adjustments Repayment of supplemental unemployment benefits under the Trade Act of 1974":
            "n/a",
          "Other Adjustments Contributions to section 501(c)(18)(D) pension plans":
            "n/a",
          "Other Adjustments Contributions by certain chaplains to section 403(b) plans":
            "n/a",
          "Other Adjustments Attorney fees and court costs for actions involving certain unlawful discrimination claims":
            "n/a",
          "Other Adjustments Attorney fees and court costs you paid in connection with an aware from the IRS for information you provided that helped the IRS deduct tax violations":
            "n/a",
          "Other Adjustments Housing deduction from Form 2555": "n/a",
          "Other Adjustments Excess deductions of section 67(e) expenses from Schedule K-1 (Form 1041)":
            "n/a",
          "Total Other Adjustments. Add Lines 24A Through 24Z": "n/a",
          "Add Lines 11 Through 23 And 25. These are your adjustments of income.":
            "n/a",
          "Schedule L Year": "n/a",
          "Assets Cash - Beginning of tax year (b)": "n/a",
          "Assets Cash - End of tax year (d)": "n/a",
          "Assets Trade Notes And Accounts Receivable - Beginning of tax year (a)":
            "n/a",
          "Assets Trade Notes And Accounts Receivable - End of tax year (c)":
            "n/a",
          "Assets Less Allowance For Bad Debts - Beginning of tax year (a)":
            "n/a",
          "Assets Less Allowance For Bad Debts - Beginning of tax year (b)":
            "n/a",
          "Assets Less Allowance For Bad Debts - End of tax year (c)": "n/a",
          "Assets Less Allowance For Bad Debts - End of tax year (d)": "n/a",
          "Assets Inventories - Beginning of tax year (b)": "n/a",
          "Assets Inventories - End of tax year (d)": "n/a",
          "Assets U.S. Government Obligations - Beginning of tax year (b)":
            "n/a",
          "Assets U.S. Government Obligations - End of tax year (d)": "n/a",
          "Assets Tax Exempt Securities - Beginning of tax year (b)": "n/a",
          "Assets Tax Exempt Securities - End of tax year (d)": "n/a",
          "Assets Other Current Assets - Beginning of tax year (b)": "n/a",
          "Assets Other Current Assets - End of tax year (d)": "n/a",
          "Assets Loans To Shareholders - Beginning of tax year (b)": "n/a",
          "Assets Loans To Shareholders - End of tax year (d)": "n/a",
          "Assets Mortgage And Real Estate Loans - Beginning of tax year (b)":
            "n/a",
          "Assets Mortgage And Real Estate Loans - End of tax year (d)": "n/a",
          "Assets Other Investments - Beginning of tax year (b)": "n/a",
          "Assets Other Investments - End of tax year (d)": "n/a",
          "Assets Buildings And Other Depreciable Assets - Beginning of tax year (a)":
            "n/a",
          "Assets Buildings And Other Depreciable Assets - End of tax year (c)":
            "n/a",
          "Assets Less Accumulated Depreciation - Beginning of tax year (a)":
            "n/a",
          "Assets Less Accumulated Depreciation - Beginning of tax year (b)":
            "n/a",
          "Assets Less Accumulated Depreciation - End of tax year (c)": "n/a",
          "Assets Less Accumulated Depreciation - End of tax year (d)": "n/a",
          "Assets Depletable Assets - Beginning of tax year (a)": "n/a",
          "Assets Depletable Assets - End of tax year (c)": "n/a",
          "Assets Less Accumulated Depletion - Beginning of tax year (a)":
            "n/a",
          "Assets Less Accumulated Depletion - Beginning of tax year (b)":
            "n/a",
          "Assets Less Accumulated Depletion - End of tax year (c)": "n/a",
          "Assets Less Accumulated Depletion - End of tax year (d)": "n/a",
          "Assets Land (Net Of Any Amortization) - Beginning of tax year (b)":
            "n/a",
          "Assets Land (Net Of Any Amortization) - End of tax year (d)": "n/a",
          "Assets Intangible Assets (Amortizable Only) - Beginning of tax year (a)":
            "n/a",
          "Assets Intangible Assets (Amortizable Only) - Beginning of tax year (b)":
            "n/a",
          "Assets Less Accumulated Amortization - Beginning of tax year (a)":
            "n/a",
          "Assets Less Accumulated Amortization - Beginning of tax year (b)":
            "n/a",
          "Assets Less Accumulated Amortization - End of tax year (c)": "n/a",
          "Assets Less Accumulated Amortization - End of tax year (d)": "n/a",
          "Assets Other Assets - Beginning of tax year (b)": "n/a",
          "Assets Other Assets - End of tax year (d)": "n/a",
          "Assets Total Assets - Beginning of tax year (b)": "n/a",
          "Assets Total Assets - End of tax year (d)": "n/a",
          "Liabilities and Shareholders' Equity Accounts Payable - Beginning of tax year (b)":
            "n/a",
          "Liabilities and Shareholders' Equity Accounts Payable - End of tax year (d)":
            "n/a",
          "Liabilities and Shareholders' Equity Mortgages Notes Bonds Payable In Less Than 1 Year - Beginning of tax year (b)":
            "n/a",
          "Liabilities and Shareholders' Equity Mortgages Notes Bonds Payable In Less Than 1 Year - End of tax year (d)":
            "n/a",
          "Liabilities and Shareholders' Equity Other Current Liabilities - Beginning of tax year (b)":
            "n/a",
          "Liabilities and Shareholders' Equity Other Current Liabilities - End of tax year (d)":
            "n/a",
          "Liabilities and Shareholders' Equity Loans From Shareholders - Beginning of tax year (b)":
            "n/a",
          "Liabilities and Shareholders' Equity Loans From Shareholders - End of tax year (d)":
            "n/a",
          "Liabilities and Shareholders' Equity Mortgages Notes Bonds Payable In 1 Year Or More - Beginning of tax year (b)":
            "n/a",
          "Liabilities and Shareholders' Equity Mortgages Notes Bonds Payable In 1 Year Or More - End of tax year (d)":
            "n/a",
          "Liabilities and Shareholders' Equity Other Liabilities - Beginning of tax year (b)":
            "n/a",
          "Liabilities and Shareholders' Equity Other Liabilities - End of tax year (d)":
            "n/a",
          "Liabilities and Shareholders' Equity Capital Stock A Preferred Stock - Beginning of tax year (a)":
            "n/a",
          "Liabilities and Shareholders' Equity Capital Stock A Preferred Stock - Beginning of tax year (b)":
            "n/a",
          "Liabilities and Shareholders' Equity Capital Stock B Common Stock - Beginning of tax year (a)":
            "n/a",
          "Liabilities and Shareholders' Equity Capital Stock B Common Stock- Beginning of tax year (b)":
            "n/a",
          "Liabilities and Shareholders' Equity Capital Stock B Common Stock - End of tax year (c)":
            "n/a",
          "Liabilities and Shareholders' Equity Capital Stock B Common Stock - End of tax year (d)":
            "n/a",
          "Liabilities and Shareholders' Equity Additional Paid In Capital - Beginning of tax year (b)":
            "n/a",
          "Liabilities and Shareholders' Equity Additional Paid In Capital - End of tax year (d)":
            "n/a",
          "Liabilities and Shareholders' Equity Retained Earnings Appropriated - Beginning of tax year (b)":
            "n/a",
          "Liabilities and Shareholders' Equity Retained Earnings Appropriated - End of tax year (d)":
            "n/a",
          "Liabilities and Shareholders' Equity Retained Earnings Unappropriated - Beginning of tax year (b)":
            "n/a",
          "Liabilities and Shareholders' Equity Retained Earnings Unappropriated - End of tax year (d)":
            "n/a",
          "Liabilities and Shareholders' Equity Adjustments To Shareholders' Equity - Beginning of tax year (b)":
            "n/a",
          "Liabilities and Shareholders' Equity Adjustments To Shareholders' Equity - End of tax year (d)":
            "n/a",
          "Liabilities and Shareholders' Equity Less Cost Of Treasury Stock - Beginning of tax year (b)":
            "n/a",
          "Liabilities and Shareholders' Equity Less Cost Of Treasury Stock - End of tax year (d)":
            "n/a",
          "Liabilities and Shareholders' Equity Total Liabilities And Shareholders' Equity - Beginning of tax year (b)":
            "n/a",
          "Liabilities and Shareholders' Equity Total Liabilities And Shareholders' Equity - End of tax year (d)":
            "n/a",
          "M-1 Net Income (Loss) Per Books": "n/a",
          "Federal Income Tax Per Books": "n/a",
          "Excess Of Capital Losses Over Capital Gains": "n/a",
          "Income Subject To Tax Not Recorded On Books This Year Description":
            "n/a",
          "Income Subject To Tax Not Recorded On Books This Year Amount": "n/a",
          "Expenses Depreciation": "n/a",
          "Expenses Charitable Contributions": "n/a",
          "Travel And Entertainment Description": "n/a",
          "Travel And Entertainment Amount": "n/a",
          "Income Recorded On Books This Year Not Included On This Return Description":
            "n/a",
          "Add Lines 1 Through 5 Net Income(loss),Federal income tax per books, Excess of capital losses over capital gains, income subject to tax not recorded on books, and Expenses recorded on books this year not deducted":
            "n/a",
          "Income Recorded On Books This Year Not Included On This Return Amount":
            "n/a",
          "Deductions Depreciation": "n/a",
          "Deductions Charitable Contributions Description": "n/a",
          "Deductions Charitable Contributions Amount": "n/a",
          "Add Lines 7 And 8 Income recorded on books not included on this return and deductions on this return not charged against book income this year":
            "n/a",
          Income: "n/a",
          "Balance At Beginning Of Year": "n/a",
          "M-2 Net Income (Loss) Per Books": "n/a",
          "Other Increases (Itemize) Description": "n/a",
          "Other Increases (Itemize) Amount": "n/a",
          "Add Lines 1, 2 And 3 Balance at beginning of year, Net Income(loss) per books, Other Increases":
            "n/a",
          "Distributions Cash": "n/a",
          "Distributions Stock": "n/a",
          "Distributions Property": "n/a",
          "Other Decreases (Itemize) Description": "n/a",
          "Other Decreases (Itemize) Amount": "n/a",
          "Add Lines 5 And 6 Distributions and Other Decreases": "n/a",
          "Balance At End Of Year (Line 4 Less Line 7)": "n/a",
          "Statement Number": "n/a",
          "Form Number": "n/a",
          "Total Deductions": "n/a",
          Title:
            "2-Income- 1040 ~ IC_LOAN_50490 1501581799_0S2YHTK5RUF4GIGJEW9MG4B1_DCA_430.pdf",
          Url: "https://cabmststr001.blob.core.windows.net/filedrive/d76d720736a702accac1326fab95475e?time=638916269554697781",
          StageName: "Exported",
          GeneratedOn: "2025-08-24T10:31:41.839171Z",
        },
      ],
      "Schedule F": [
        {
          Year: "2023",
          "Beginning Date Of Tax Year": "Jan 1",
          "Ending Date Of Tax Year": "Dec 31",
          "Your First Name And Middle Initial": "Roger D",
          "Last Name": "Harrison",
          "Your Social Security Number": "639-32-1844",
          "Home Address 1": "N/A",
          "Home Address City": "N/A",
          "Home Address State": "N/A",
          "Home Address Zip Code": "N/A",
          "Presidential Election Campaign You": "0",
          "Presidential Election Campaign Spouse": "0",
          "Filing Status Single": "0",
          "Filing Status Married filing jointly (even if only one had income)":
            "0",
          "Filing Status Married filing separately (MFS)": "0",
          "Filing Status Head of household (HOH)": "0",
          "Filing Status Qualifying surviving spouse (QSS)": "0",
          "At Any Time During 2023 Did You Receive Sell Exchange Yes": "N/A",
          "At Any Time During 2023 Did You Receive Sell Exchange No": "N/A",
          "Someone Can Claim You as a dependent": "N/A",
          "Someone Can Claim Your spouse as a dependent": "N/A",
          "Spouse Itemizes On A Separate Return Or You Were A Dual Status Alien":
            "N/A",
          "Age/Blindness You Were born before January 2, 1959": "N/A",
          "Age/Blindness You Are blind": "N/A",
          "Age/Blindness Spouse Was born before January 2, 1959": "N/A",
          "Spouse Is blind": "N/A",
          "If More Than Four Dependents": "N/A",
          "Total Amount From Form(s) W2 Box 1": "N/A",
          "Add Lines 1a Through 1h Income": "N/A",
          "Tax Exempt Interest": "N/A",
          "Taxable Interest": "N/A",
          "Qualified Dividends": "N/A",
          "Add Lines 1Z 2B 3B 4B 5B 6B 7 And 8. This is your total income.":
            "N/A",
          "Adjustments To Income From Schedule 1 Line 26": "N/A",
          "Subtract Line 10 From Line 9 This Is Your Adjusted Gross Income":
            "N/A",
          "Standard Deduction Or Itemized Deductions": "N/A",
          "Add Lines 12 And 13 Deductions": "N/A",
          "Subtract Line 14 From Line 11": "N/A",
          "Add Lines 22 And 23. This Is Your Total Tax This is your total tax.":
            "N/A",
          "If Joint Return Spouse's First Name And Middle Initial": "N/A",
          "Spouse's Last Name": "N/A",
          "Spouse's Social Security Number": "N/A",
          "Home Address 2": "N/A",
          "Foreign Country Name": "N/A",
          "Foreign Province/State/County": "N/A",
          "Foreign Postal Code": "N/A",
          "If You Checked The MFS Box Enter The Name Of Your Spouse. If You Checked The HOH Or QSS":
            "N/A",
          "Dependents (Line 1) First Name": "N/A",
          "Dependents (Line 1) Last Name": "N/A",
          "Dependents (Line 1) Social Security Number": "N/A",
          "Dependents (Line 1) Relationship to you": "N/A",
          "Dependents (Line 1) Check the box if qualifies for Child Tax Credit":
            "N/A",
          "Dependents (Line 1) Check the box if qualifies for Credit for other dependents":
            "N/A",
          "Dependents (Line 2) First Name": "N/A",
          "Dependents (Line 2) Last Name": "N/A",
          "Dependents (Line 2) Social Security Number": "N/A",
          "Dependents (Line 2) Relationship to you": "N/A",
          "Dependents (Line 2) Check the box if qualifies for Child Tax Credit":
            "N/A",
          "Dependents (Line 2) Check the box if qualifies for Credit for other dependents":
            "N/A",
          "Dependents (Line 3) First Name": "N/A",
          "Dependents (Line 3) Last Name": "N/A",
          "Dependents (Line 3) Social Security Number": "N/A",
          "Dependents (Line 3) Relationship to you": "N/A",
          "Dependents (Line 3) Check the box if qualifies for Child Tax Credit":
            "N/A",
          "Dependents (Line 3) Check the box if qualifies for Credit for other dependents":
            "N/A",
          "Dependents (Line 4) First Name": "N/A",
          "Dependents (Line 4) Last Name": "N/A",
          "Dependents (Line 4) Social Security Number": "N/A",
          "Dependents (Line 4) Relationship to you": "N/A",
          "Dependents (Line 4) Check the box if qualifies for Child Tax Credit":
            "N/A",
          "Dependents (Line 4) Check the box if qualifies for Credit for other dependents":
            "N/A",
          "Household Employee Wages Not Reported On Form(s) W2": "N/A",
          "Tip Income Not Reported On Line 1a": "N/A",
          "Medicaid Waiver Payments Not Reported On Form(s) W2": "N/A",
          "Taxable Dependent Care Benefits From Form 2441 Line 26": "N/A",
          "Employer Provided Adoption Benefits From Form 8839 Line 29": "N/A",
          "Wages From Form 8919 Line 6": "N/A",
          "Other Earned Income": "N/A",
          "Nontaxable Combat Pay Election": "N/A",
          "Ordinary Dividends": "N/A",
          "IRA Distributions": "N/A",
          "IRA Distributions Taxable Amount": "N/A",
          "Pensions And Annuities": "N/A",
          "Pension and Annuities Taxable Amount": "N/A",
          "Social Security Benefits": "N/A",
          "Social Security Benefits Taxable Amount": "N/A",
          "If You Elect To Use The Lump Sum Election Method Check Here": "N/A",
          "Capital Gain Or (Loss) Amount": "N/A",
          "Capital Gain Or (Loss) Checkbox": "N/A",
          "Additional Income From Schedule 1 Line 10": "N/A",
          "Qualified Business Income Deduction From Form 8995 Or Form 8995 A":
            "N/A",
          "Tax Check If Any From Form(s) 1 - 8814": "0",
          "Tax Check If Any From Form(s) 2 - 4972": "0",
          "Tax Check If Any From Form(s) 3 - Checkbox": "0",
          "Tax Check If Any From Form(s) 3 - Text": "N/A",
          "Tax Check If Any From Form(s)": "N/A",
          "Amount From Schedule 2 Line 3": "N/A",
          "Add Lines 16 And 17 Tax": "N/A",
          "Child Tax Credit Or Credit For Other Dependents From Schedule 8812":
            "N/A",
          "Amount From Schedule 3 Line 8": "N/A",
          "Add Lines 19 And 20 Child Tax Credit and Amount from Schedule 3":
            "N/A",
          "Subtract Line 21 From Line 18 If Zero Or Less Enter 0": "N/A",
          "Other Taxes Including Self Employment Tax From Schedule 2 Line 21":
            "N/A",
          "Federal Income Tax Withheld From Form(s) W": "N/A",
          "Federal Income Tax Withheld From Form(s) 1099": "N/A",
          "Federal Income Tax Withheld From Other Forms (See Instructions)":
            "N/A",
          "Federal Income Tax Withheld From Add Lines 25A Through 25C": "N/A",
          "2023 Estimated Tax Payments And Amount Applied From 2022 Return":
            "N/A",
          "Earned Income Credit (EIC)": "N/A",
          "Additional Child Tax Credit From Schedule 8812": "N/A",
          "American Opportunity Credit From Form 8863 Line 8": "N/A",
          "Reserved for future use": "n/a",
          "Amount From Schedule 3 Line 15": "N/A",
          "Add Lines 27 28 29 And 31. These Are Your Total Other Payments And Refundable":
            "N/A",
          "Add Lines 25D 26 And 32. These Are Your Total Payments": "N/A",
          "If Line 33 Is More Than Line 24 Subtract Line 24 From Line 33":
            "N/A",
          "Amount Of Line 34 You Want Refunded To You Amount": "N/A",
          "If Form 8888 Is Attached Check Here Checkbox": "1",
          "Routing Number": "11419708",
          "Type Checking": "1",
          "Type Savings": "0",
          "Account Number": "884809",
          "Amount Of Line 34 You Want Applied To Your 2024 Estimated Tax":
            "N/A",
          "Subtract Line 33 From Line 24. This is The Amount You Owe": "N/A",
          "Estimated Tax Penalty": "N/A",
          "Do You Want To Allow Another Person To Discuss This Return With IRS? Yes":
            "1",
          "Do You Want To Allow Another Person To Discuss This Return With IRS? No":
            "0",
          "Designee's Name": "Roger D Harrison",
          "Designee Phone No.": "210 710-7523",
          "Designee Personal Identification Number (PIN)": "65076",
          "Sign Here Your Signature": "signed",
          "Sign Here Date": "4/2/2024",
          "Your Occupation": "N/A",
          "If The IRS Sent You An Identity Protection PIN Enter It Here": "N/A",
          "Spouse's Signature": "N/A",
          "Spouse's Date": "N/A",
          "Spouse's Occupation": "N/A",
          "If The IRS Sent Your Spouse An Identity Protection PIN Enter It Here":
            "N/A",
          "Sign Here Phone No.": "N/A",
          "Sign Here Email Address": "N/A",
          "Preparer's Name": "Roger D Harrison",
          "Preparer's Signature": "Roger D Harrison",
          "Paid Preparer Use Only Date": "4/9/2024",
          "Paid Preparer Use Only PTIN": "P01217238",
          "Paid Preparer Use Only Check If Self-employed": "1",
          "Paid Preparer Use Only Firm's Name": "R D Harrison CPA",
          "Paid Preparer Use Only Firm's Address 1": "PO Box 2785",
          "Paid Preparer Use Only Firm's Address 2": "N/A",
          "Paid Preparer Use Only Firm's Address City": "Grapevine",
          "Paid Preparer Use Only Firm's Address State": "TX",
          "Paid Preparer Use Only Firm's Address Zip Code": "76099-2785",
          "Paid Preparer Use Only Phone No.": "210 710-7523",
          "Firm's EIN": "74-2999811",
          "Name(s) Shown On Return": "Samuel C Sotello",
          "Identifying Number": "639-32-1844",
          "Borrower Name": "Samuel C Sotello",
          Field: "Samuel C Sotello",
          "Name Of Proprietor": "Samuel C Sotello",
          "Social Security Number (SSN)": "1844",
          "Principal Crop Or Activity": "Cattle",
          "Enter Code From Part IV": "112111",
          "Accounting Method Cash": "1",
          "Accounting Method Accrual": "0",
          "Employer ID Number (EIN)": "n/A",
          "Did You Materially Participate In The Operation Of This Business During 2023? Yes":
            "1",
          "Did You Materially Participate In The Operation Of This Business During 2023? No":
            "0",
          "Did You Make Any Payments In 2023 That Would Require You To File Form(s) 1099? Yes":
            "1",
          "Did You Make Any Payments In 2023 That Would Require You To File Form(s) 1099? No":
            "0",
          "If Yes Did You Or Will You File Required Form(s) 1099? Yes": "1",
          "If Yes Did You Or Will You File Required Form(s) 1099? No": "0",
          "Sales Of Purchased Livestock And Other Resale Items": "n/A",
          "Cost Or Other Basis Of Purchased Livestock Or Other Items Reported On Line 1A":
            "n/A",
          "Subtract Line 1B From Line 1A": "n/A",
          "Sales Of Livestock Produce Grains And Other Products You Raised":
            "25,159",
          "Cash Method Cooperative Distributions (Form(s) 1099": "n/A",
          "Cash Method Cooperative Distributions Taxable Amount": "n/A",
          "Cash Method Agricultural Program Payments": "n/A",
          "Cash Method Agricultural Program Payments Taxable Amount": "n/A",
          "Commodity Credit Corporation (CCC) Loans Reported Under Election":
            "n/A",
          "CCC Loans Forfeited": "n/A",
          "Cash Method CCC Loans Forfeited Taxable Amount": "n/A",
          "Crop Insurance Proceeds And Federal Crop Disaster Payments Amount received in Year":
            "n/A",
          "Taxable Amount": "n/A",
          "Amount deferred from Year": "n/A",
          "Cash Method Custom Hire (Machine Work) Income": "n/A",
          "Other Income Including Federal And State Gasoline Or Fuel Tax Credit Or Refund":
            "n/A",
          "Cash Method Gross Income": "25,159",
          "Car And Truck Expenses": "n/A",
          Chemicals: "n/A",
          "Conservation Expenses": "n/A",
          "Custom Hire (Machine Work)": "n/A",
          "Depreciation And Section 179 Expense": "4,788",
          "Employee Benefit Programs Other Than On Line 23": "n/A",
          Feed: "11,613",
          "Fertilizers And Lime": "n/A",
          "Freight And Trucking": "n/A",
          "Gasoline Fuel And Oil": "n/A",
          "Insurance (Other Than Health)": "3,403",
          "Interest Mortgage": "n/A",
          "Interest Other": "n/A",
          "Labor Hired (Less Employment Credits)": "272",
          "Pension And Profit Sharing Plans": "n/A",
          "Repairs And Maintenance": "702",
          "Seeds And Plants": "n/A",
          "Storage And Warehousing": "14,615",
          Supplies: "n/A",
          Taxes: "n/A",
          Utilities: "n/A",
          "Veterinary Breeding And Medicine": "448",
          "Total Expenses": "40,641",
          "Net Farm Profit Or (Loss)": "-15,482",
          "Check The Box That Describes Your Investment In This Activity: All investment is at risk":
            "1",
          "Check The Box That Describes Your Investment In This Activity: Some investment is not at risk.":
            "0",
          "Sales Of Livestock Produce Grains And Other Products": "n/A",
          "Accrual Method Cooperative Distributions (Form(s) 1099": "n/A",
          "Accrual Method Cooperative Distributions Taxable Amount": "n/A",
          "Accrual Method Agricultural Program Payments": "n/A",
          "Accrual Method CCC Loans Forfeited": "n/A",
          "Commodity Credit Corporation (CCC) Loans a CCC loans reported under election":
            "n/A",
          "Commodity Credit Corporation (CCC) Loans CCC loans forfeited": "n/A",
          "Commodity Credit Corporation (CCC) Loans Taxable amount": "n/A",
          "Crop Insurance Proceeds": "n/A",
          "Accrual Method Custom Hire (Machine Work) Income": "n/A",
          "Other Income": "n/A",
          "Add Amounts In The Right Column For Lines 37 Through 43 Farm Income Accural Method":
            "n/A",
          "Inventory Of Livestock Produce Grains And Other Products": "n/A",
          "Cost Of Livestock Produce Grains And Other Products Purchased During The Year":
            "n/A",
          "Add Lines 45 And 46 Inventory Of Live Stock and Cost of Live Stock":
            "n/A",
          "Inventory Of Livestock Produce Grains And Other Products At End Of Year":
            "n/A",
          "Cost Of Livestock Produce Grains And Other Products Sold": "n/A",
          "Accrual Method Gross Income": "n/A",
          "If election to defer to 2024 is attached": "n/A",
          "Rent or Lease Vehicle, machinery, equipment": "n/A",
          "Rent or Lease Other (land, animals, etc.)": "n/A",
          "Name(s) Shown On Form 1040 1040-SR Or 1040-NR": "Samuel C Sotello",
          "Taxable Refunds Credits Or Offsets Of State And Local Income Taxes":
            "1",
          "Alimony Received": "n/a",
          "Alimony received - Date Of Original Divorce Or Separation Agreement":
            "n/a",
          "Business Income Or (Loss) Attach Schedule C": "n/a",
          "Other Gains Or (Losses) Attach Form 4797": "n/a",
          "Rental Real Estate Royalties Partnerships S Corporations Trusts Etc. Attach Schedule E":
            "n/a",
          "Farm Income Or (Loss) Attach Schedule F": "-15,482",
          "Unemployment Compensation": "n/a",
          "Other Income Net operating loss": "n/a",
          "Other Income Gambling": "n/a",
          "Other Income Cancellation of debt": "n/a",
          "Other Income Foreign earned income exclusion from Form 2555": "n/a",
          "Other Income from Form 8853": "n/a",
          "Other Income from Form 8889": "n/a",
          "Other Income Alaska Permanent Fund dividends": "n/a",
          "Other Income Jury duty pay": "n/a",
          "Other Income Prizes and awards": "n/a",
          "Other Income Activity not engaged in for profit income": "n/a",
          "Other Income Stock options": "n/a",
          "Other Income from the rental of personal property": "n/a",
          "Other Income Olympic and Paralympic medals and USOC prize money":
            "n/a",
          "Other Income Section 951(a) inclusion": "n/a",
          "Other Income Section 951A(a) inclusion": "n/a",
          "Other Income Section 461(l) excess business loss adjustment": "n/a",
          "Other Income Taxable distributions from an ABLE account": "n/a",
          "Other Income Scholarship and fellowship grants not reported on Form W-2":
            "n/a",
          "Other Income Nontaxable amount of Medicaid waiver payments included on Form 1040 line 1a or 1d":
            "n/a",
          "Other Income Pension or annuity from a nonqualified deferred compensation plan or a nongovernment section 457 plan":
            "n/a",
          "Other Income Wages earned while incarcerated": "n/a",
          "Other Income Digital assets received as ordinary income not reported elsewhere":
            "n/a",
          "Total Other Income Add Lines 8A Through 8Z": "n/a",
          "Combine Lines 1 Through 7 And 9. This is your additional income.":
            "-15,482",
          "Educator Expenses": "n/a",
          "Certain Business Expenses Of Reservists Performing Artists and fee-basis government officials. Attach Form 2106":
            "n/a",
          "Health Savings Account Deduction. Attach Form 8889": "n/a",
          "Moving Expenses For Members Of The Armed Forces. Attach Form 3903":
            "n/a",
          "Deductible Part Of Self-Employment Tax. Attach Schedule SE": "n/a",
          "Self-Employed SEP SIMPLE And Qualified Plans": "n/a",
          "Self-Employed Health Insurance Deduction": "n/a",
          "Penalty On Early Withdrawal Of Savings": "n/a",
          "Alimony Paid": "n/a",
          "Recipient's SSN": "n/a",
          "Alimony Paid - Date Of Original Divorce Or Separation Agreement":
            "n/a",
          "IRA Deduction": "n/a",
          "Student Loan Interest Deduction": "n/a",
          "Archer MSA Deduction": "n/a",
          "Other Adjustments Jury duty pay": "n/a",
          "Other Adjustments Deductible expenses related to income reported on line 8l from the rental of personal property engaged in for profit":
            "n/a",
          "Other Adjustments Nontaxable amount of the value of Olympic and Paralympic medals and USOC prize money reported on line 8m":
            "n/a",
          "Other Adjustments Reforestation amortization and expenses": "n/a",
          "Other Adjustments Repayment of supplemental unemployment benefits under the Trade Act of 1974":
            "n/a",
          "Other Adjustments Contributions to section 501(c)(18)(D) pension plans":
            "n/a",
          "Other Adjustments Contributions by certain chaplains to section 403(b) plans":
            "n/a",
          "Other Adjustments Attorney fees and court costs for actions involving certain unlawful discrimination claims":
            "n/a",
          "Other Adjustments Attorney fees and court costs you paid in connection with an aware from the IRS for information you provided that helped the IRS deduct tax violations":
            "n/a",
          "Other Adjustments Housing deduction from Form 2555": "n/a",
          "Other Adjustments Excess deductions of section 67(e) expenses from Schedule K-1 (Form 1041)":
            "n/a",
          "Total Other Adjustments. Add Lines 24A Through 24Z": "n/a",
          "Add Lines 11 Through 23 And 25. These are your adjustments of income.":
            "n/a",
          "Schedule L Year": "n/a",
          "Assets Cash - Beginning of tax year (b)": "n/a",
          "Assets Cash - End of tax year (d)": "n/a",
          "Assets Trade Notes And Accounts Receivable - Beginning of tax year (a)":
            "n/a",
          "Assets Trade Notes And Accounts Receivable - End of tax year (c)":
            "n/a",
          "Assets Less Allowance For Bad Debts - Beginning of tax year (a)":
            "n/a",
          "Assets Less Allowance For Bad Debts - Beginning of tax year (b)":
            "n/a",
          "Assets Less Allowance For Bad Debts - End of tax year (c)": "n/a",
          "Assets Less Allowance For Bad Debts - End of tax year (d)": "n/a",
          "Assets Inventories - Beginning of tax year (b)": "n/a",
          "Assets Inventories - End of tax year (d)": "n/a",
          "Assets U.S. Government Obligations - Beginning of tax year (b)":
            "n/a",
          "Assets U.S. Government Obligations - End of tax year (d)": "n/a",
          "Assets Tax Exempt Securities - Beginning of tax year (b)": "n/a",
          "Assets Tax Exempt Securities - End of tax year (d)": "n/a",
          "Assets Other Current Assets - Beginning of tax year (b)": "n/a",
          "Assets Other Current Assets - End of tax year (d)": "n/a",
          "Assets Loans To Shareholders - Beginning of tax year (b)": "n/a",
          "Assets Loans To Shareholders - End of tax year (d)": "n/a",
          "Assets Mortgage And Real Estate Loans - Beginning of tax year (b)":
            "n/a",
          "Assets Mortgage And Real Estate Loans - End of tax year (d)": "n/a",
          "Assets Other Investments - Beginning of tax year (b)": "n/a",
          "Assets Other Investments - End of tax year (d)": "n/a",
          "Assets Buildings And Other Depreciable Assets - Beginning of tax year (a)":
            "n/a",
          "Assets Buildings And Other Depreciable Assets - End of tax year (c)":
            "n/a",
          "Assets Less Accumulated Depreciation - Beginning of tax year (a)":
            "n/a",
          "Assets Less Accumulated Depreciation - Beginning of tax year (b)":
            "n/a",
          "Assets Less Accumulated Depreciation - End of tax year (c)": "n/a",
          "Assets Less Accumulated Depreciation - End of tax year (d)": "n/a",
          "Assets Depletable Assets - Beginning of tax year (a)": "n/a",
          "Assets Depletable Assets - End of tax year (c)": "n/a",
          "Assets Less Accumulated Depletion - Beginning of tax year (a)":
            "n/a",
          "Assets Less Accumulated Depletion - Beginning of tax year (b)":
            "n/a",
          "Assets Less Accumulated Depletion - End of tax year (c)": "n/a",
          "Assets Less Accumulated Depletion - End of tax year (d)": "n/a",
          "Assets Land (Net Of Any Amortization) - Beginning of tax year (b)":
            "n/a",
          "Assets Land (Net Of Any Amortization) - End of tax year (d)": "n/a",
          "Assets Intangible Assets (Amortizable Only) - Beginning of tax year (a)":
            "n/a",
          "Assets Intangible Assets (Amortizable Only) - Beginning of tax year (b)":
            "n/a",
          "Assets Less Accumulated Amortization - Beginning of tax year (a)":
            "n/a",
          "Assets Less Accumulated Amortization - Beginning of tax year (b)":
            "n/a",
          "Assets Less Accumulated Amortization - End of tax year (c)": "n/a",
          "Assets Less Accumulated Amortization - End of tax year (d)": "n/a",
          "Assets Other Assets - Beginning of tax year (b)": "n/a",
          "Assets Other Assets - End of tax year (d)": "n/a",
          "Assets Total Assets - Beginning of tax year (b)": "n/a",
          "Assets Total Assets - End of tax year (d)": "n/a",
          "Liabilities and Shareholders' Equity Accounts Payable - Beginning of tax year (b)":
            "n/a",
          "Liabilities and Shareholders' Equity Accounts Payable - End of tax year (d)":
            "n/a",
          "Liabilities and Shareholders' Equity Mortgages Notes Bonds Payable In Less Than 1 Year - Beginning of tax year (b)":
            "n/a",
          "Liabilities and Shareholders' Equity Mortgages Notes Bonds Payable In Less Than 1 Year - End of tax year (d)":
            "n/a",
          "Liabilities and Shareholders' Equity Other Current Liabilities - Beginning of tax year (b)":
            "n/a",
          "Liabilities and Shareholders' Equity Other Current Liabilities - End of tax year (d)":
            "n/a",
          "Liabilities and Shareholders' Equity Loans From Shareholders - Beginning of tax year (b)":
            "n/a",
          "Liabilities and Shareholders' Equity Loans From Shareholders - End of tax year (d)":
            "n/a",
          "Liabilities and Shareholders' Equity Mortgages Notes Bonds Payable In 1 Year Or More - Beginning of tax year (b)":
            "n/a",
          "Liabilities and Shareholders' Equity Mortgages Notes Bonds Payable In 1 Year Or More - End of tax year (d)":
            "n/a",
          "Liabilities and Shareholders' Equity Other Liabilities - Beginning of tax year (b)":
            "n/a",
          "Liabilities and Shareholders' Equity Other Liabilities - End of tax year (d)":
            "n/a",
          "Liabilities and Shareholders' Equity Capital Stock A Preferred Stock - Beginning of tax year (a)":
            "n/a",
          "Liabilities and Shareholders' Equity Capital Stock A Preferred Stock - Beginning of tax year (b)":
            "n/a",
          "Liabilities and Shareholders' Equity Capital Stock B Common Stock - Beginning of tax year (a)":
            "n/a",
          "Liabilities and Shareholders' Equity Capital Stock B Common Stock- Beginning of tax year (b)":
            "n/a",
          "Liabilities and Shareholders' Equity Capital Stock B Common Stock - End of tax year (c)":
            "n/a",
          "Liabilities and Shareholders' Equity Capital Stock B Common Stock - End of tax year (d)":
            "n/a",
          "Liabilities and Shareholders' Equity Additional Paid In Capital - Beginning of tax year (b)":
            "n/a",
          "Liabilities and Shareholders' Equity Additional Paid In Capital - End of tax year (d)":
            "n/a",
          "Liabilities and Shareholders' Equity Retained Earnings Appropriated - Beginning of tax year (b)":
            "n/a",
          "Liabilities and Shareholders' Equity Retained Earnings Appropriated - End of tax year (d)":
            "n/a",
          "Liabilities and Shareholders' Equity Retained Earnings Unappropriated - Beginning of tax year (b)":
            "n/a",
          "Liabilities and Shareholders' Equity Retained Earnings Unappropriated - End of tax year (d)":
            "n/a",
          "Liabilities and Shareholders' Equity Adjustments To Shareholders' Equity - Beginning of tax year (b)":
            "n/a",
          "Liabilities and Shareholders' Equity Adjustments To Shareholders' Equity - End of tax year (d)":
            "n/a",
          "Liabilities and Shareholders' Equity Less Cost Of Treasury Stock - Beginning of tax year (b)":
            "n/a",
          "Liabilities and Shareholders' Equity Less Cost Of Treasury Stock - End of tax year (d)":
            "n/a",
          "Liabilities and Shareholders' Equity Total Liabilities And Shareholders' Equity - Beginning of tax year (b)":
            "n/a",
          "Liabilities and Shareholders' Equity Total Liabilities And Shareholders' Equity - End of tax year (d)":
            "n/a",
          "M-1 Net Income (Loss) Per Books": "n/a",
          "Federal Income Tax Per Books": "n/a",
          "Excess Of Capital Losses Over Capital Gains": "n/a",
          "Income Subject To Tax Not Recorded On Books This Year Description":
            "n/a",
          "Income Subject To Tax Not Recorded On Books This Year Amount": "n/a",
          "Expenses Depreciation": "n/a",
          "Expenses Charitable Contributions": "n/a",
          "Travel And Entertainment Description": "n/a",
          "Travel And Entertainment Amount": "n/a",
          "Income Recorded On Books This Year Not Included On This Return Description":
            "n/a",
          "Add Lines 1 Through 5 Net Income(loss),Federal income tax per books, Excess of capital losses over capital gains, income subject to tax not recorded on books, and Expenses recorded on books this year not deducted":
            "n/a",
          "Income Recorded On Books This Year Not Included On This Return Amount":
            "n/a",
          "Deductions Depreciation": "n/a",
          "Deductions Charitable Contributions Description": "n/a",
          "Deductions Charitable Contributions Amount": "n/a",
          "Add Lines 7 And 8 Income recorded on books not included on this return and deductions on this return not charged against book income this year":
            "n/a",
          Income: "n/a",
          "Balance At Beginning Of Year": "n/a",
          "M-2 Net Income (Loss) Per Books": "n/a",
          "Other Increases (Itemize) Description": "n/a",
          "Other Increases (Itemize) Amount": "n/a",
          "Add Lines 1, 2 And 3 Balance at beginning of year, Net Income(loss) per books, Other Increases":
            "n/a",
          "Distributions Cash": "n/a",
          "Distributions Stock": "n/a",
          "Distributions Property": "n/a",
          "Other Decreases (Itemize) Description": "n/a",
          "Other Decreases (Itemize) Amount": "n/a",
          "Add Lines 5 And 6 Distributions and Other Decreases": "n/a",
          "Balance At End Of Year (Line 4 Less Line 7)": "n/a",
          "Statement Number": "n/a",
          "Form Number": "n/a",
          "Total Deductions": "n/a",
          Title:
            "2-Income- 1040 ~ IC_LOAN_50490 1501581799_0S2YHTK5RUF4GIGJEW9MG4B1_DCA_430.pdf",
          Url: "https://cabmststr001.blob.core.windows.net/filedrive/d76d720736a702accac1326fab95475e?time=638916269554697781",
          StageName: "Exported",
          GeneratedOn: "2025-08-24T10:31:41.839171Z",
        },
      ],
      "Schedule 1": [
        {
          Year: "2023",
          "Beginning Date Of Tax Year": "Jan 1",
          "Ending Date Of Tax Year": "Dec 31",
          "Your First Name And Middle Initial": "Roger D",
          "Last Name": "Harrison",
          "Your Social Security Number": "639-32-1844",
          "Home Address 1": "N/A",
          "Home Address City": "N/A",
          "Home Address State": "N/A",
          "Home Address Zip Code": "N/A",
          "Presidential Election Campaign You": "0",
          "Presidential Election Campaign Spouse": "0",
          "Filing Status Single": "0",
          "Filing Status Married filing jointly (even if only one had income)":
            "0",
          "Filing Status Married filing separately (MFS)": "0",
          "Filing Status Head of household (HOH)": "0",
          "Filing Status Qualifying surviving spouse (QSS)": "0",
          "At Any Time During 2023 Did You Receive Sell Exchange Yes": "N/A",
          "At Any Time During 2023 Did You Receive Sell Exchange No": "N/A",
          "Someone Can Claim You as a dependent": "N/A",
          "Someone Can Claim Your spouse as a dependent": "N/A",
          "Spouse Itemizes On A Separate Return Or You Were A Dual Status Alien":
            "N/A",
          "Age/Blindness You Were born before January 2, 1959": "N/A",
          "Age/Blindness You Are blind": "N/A",
          "Age/Blindness Spouse Was born before January 2, 1959": "N/A",
          "Spouse Is blind": "N/A",
          "If More Than Four Dependents": "N/A",
          "Total Amount From Form(s) W2 Box 1": "N/A",
          "Add Lines 1a Through 1h Income": "N/A",
          "Tax Exempt Interest": "N/A",
          "Taxable Interest": "N/A",
          "Qualified Dividends": "N/A",
          "Add Lines 1Z 2B 3B 4B 5B 6B 7 And 8. This is your total income.":
            "N/A",
          "Adjustments To Income From Schedule 1 Line 26": "N/A",
          "Subtract Line 10 From Line 9 This Is Your Adjusted Gross Income":
            "N/A",
          "Standard Deduction Or Itemized Deductions": "N/A",
          "Add Lines 12 And 13 Deductions": "N/A",
          "Subtract Line 14 From Line 11": "N/A",
          "Add Lines 22 And 23. This Is Your Total Tax This is your total tax.":
            "N/A",
          "If Joint Return Spouse's First Name And Middle Initial": "N/A",
          "Spouse's Last Name": "N/A",
          "Spouse's Social Security Number": "N/A",
          "Home Address 2": "N/A",
          "Foreign Country Name": "N/A",
          "Foreign Province/State/County": "N/A",
          "Foreign Postal Code": "N/A",
          "If You Checked The MFS Box Enter The Name Of Your Spouse. If You Checked The HOH Or QSS":
            "N/A",
          "Dependents (Line 1) First Name": "N/A",
          "Dependents (Line 1) Last Name": "N/A",
          "Dependents (Line 1) Social Security Number": "N/A",
          "Dependents (Line 1) Relationship to you": "N/A",
          "Dependents (Line 1) Check the box if qualifies for Child Tax Credit":
            "N/A",
          "Dependents (Line 1) Check the box if qualifies for Credit for other dependents":
            "N/A",
          "Dependents (Line 2) First Name": "N/A",
          "Dependents (Line 2) Last Name": "N/A",
          "Dependents (Line 2) Social Security Number": "N/A",
          "Dependents (Line 2) Relationship to you": "N/A",
          "Dependents (Line 2) Check the box if qualifies for Child Tax Credit":
            "N/A",
          "Dependents (Line 2) Check the box if qualifies for Credit for other dependents":
            "N/A",
          "Dependents (Line 3) First Name": "N/A",
          "Dependents (Line 3) Last Name": "N/A",
          "Dependents (Line 3) Social Security Number": "N/A",
          "Dependents (Line 3) Relationship to you": "N/A",
          "Dependents (Line 3) Check the box if qualifies for Child Tax Credit":
            "N/A",
          "Dependents (Line 3) Check the box if qualifies for Credit for other dependents":
            "N/A",
          "Dependents (Line 4) First Name": "N/A",
          "Dependents (Line 4) Last Name": "N/A",
          "Dependents (Line 4) Social Security Number": "N/A",
          "Dependents (Line 4) Relationship to you": "N/A",
          "Dependents (Line 4) Check the box if qualifies for Child Tax Credit":
            "N/A",
          "Dependents (Line 4) Check the box if qualifies for Credit for other dependents":
            "N/A",
          "Household Employee Wages Not Reported On Form(s) W2": "N/A",
          "Tip Income Not Reported On Line 1a": "N/A",
          "Medicaid Waiver Payments Not Reported On Form(s) W2": "N/A",
          "Taxable Dependent Care Benefits From Form 2441 Line 26": "N/A",
          "Employer Provided Adoption Benefits From Form 8839 Line 29": "N/A",
          "Wages From Form 8919 Line 6": "N/A",
          "Other Earned Income": "N/A",
          "Nontaxable Combat Pay Election": "N/A",
          "Ordinary Dividends": "N/A",
          "IRA Distributions": "N/A",
          "IRA Distributions Taxable Amount": "N/A",
          "Pensions And Annuities": "N/A",
          "Pension and Annuities Taxable Amount": "N/A",
          "Social Security Benefits": "N/A",
          "Social Security Benefits Taxable Amount": "N/A",
          "If You Elect To Use The Lump Sum Election Method Check Here": "N/A",
          "Capital Gain Or (Loss) Amount": "N/A",
          "Capital Gain Or (Loss) Checkbox": "N/A",
          "Additional Income From Schedule 1 Line 10": "N/A",
          "Qualified Business Income Deduction From Form 8995 Or Form 8995 A":
            "N/A",
          "Tax Check If Any From Form(s) 1 - 8814": "0",
          "Tax Check If Any From Form(s) 2 - 4972": "0",
          "Tax Check If Any From Form(s) 3 - Checkbox": "0",
          "Tax Check If Any From Form(s) 3 - Text": "N/A",
          "Tax Check If Any From Form(s)": "N/A",
          "Amount From Schedule 2 Line 3": "N/A",
          "Add Lines 16 And 17 Tax": "N/A",
          "Child Tax Credit Or Credit For Other Dependents From Schedule 8812":
            "N/A",
          "Amount From Schedule 3 Line 8": "N/A",
          "Add Lines 19 And 20 Child Tax Credit and Amount from Schedule 3":
            "N/A",
          "Subtract Line 21 From Line 18 If Zero Or Less Enter 0": "N/A",
          "Other Taxes Including Self Employment Tax From Schedule 2 Line 21":
            "N/A",
          "Federal Income Tax Withheld From Form(s) W": "N/A",
          "Federal Income Tax Withheld From Form(s) 1099": "N/A",
          "Federal Income Tax Withheld From Other Forms (See Instructions)":
            "N/A",
          "Federal Income Tax Withheld From Add Lines 25A Through 25C": "N/A",
          "2023 Estimated Tax Payments And Amount Applied From 2022 Return":
            "N/A",
          "Earned Income Credit (EIC)": "N/A",
          "Additional Child Tax Credit From Schedule 8812": "N/A",
          "American Opportunity Credit From Form 8863 Line 8": "N/A",
          "Reserved for future use": "n/a",
          "Amount From Schedule 3 Line 15": "N/A",
          "Add Lines 27 28 29 And 31. These Are Your Total Other Payments And Refundable":
            "N/A",
          "Add Lines 25D 26 And 32. These Are Your Total Payments": "N/A",
          "If Line 33 Is More Than Line 24 Subtract Line 24 From Line 33":
            "N/A",
          "Amount Of Line 34 You Want Refunded To You Amount": "N/A",
          "If Form 8888 Is Attached Check Here Checkbox": "1",
          "Routing Number": "11419708",
          "Type Checking": "1",
          "Type Savings": "0",
          "Account Number": "884809",
          "Amount Of Line 34 You Want Applied To Your 2024 Estimated Tax":
            "N/A",
          "Subtract Line 33 From Line 24. This is The Amount You Owe": "N/A",
          "Estimated Tax Penalty": "N/A",
          "Do You Want To Allow Another Person To Discuss This Return With IRS? Yes":
            "1",
          "Do You Want To Allow Another Person To Discuss This Return With IRS? No":
            "0",
          "Designee's Name": "Roger D Harrison",
          "Designee Phone No.": "210 710-7523",
          "Designee Personal Identification Number (PIN)": "65076",
          "Sign Here Your Signature": "signed",
          "Sign Here Date": "4/2/2024",
          "Your Occupation": "N/A",
          "If The IRS Sent You An Identity Protection PIN Enter It Here": "N/A",
          "Spouse's Signature": "N/A",
          "Spouse's Date": "N/A",
          "Spouse's Occupation": "N/A",
          "If The IRS Sent Your Spouse An Identity Protection PIN Enter It Here":
            "N/A",
          "Sign Here Phone No.": "N/A",
          "Sign Here Email Address": "N/A",
          "Preparer's Name": "Roger D Harrison",
          "Preparer's Signature": "Roger D Harrison",
          "Paid Preparer Use Only Date": "4/9/2024",
          "Paid Preparer Use Only PTIN": "P01217238",
          "Paid Preparer Use Only Check If Self-employed": "1",
          "Paid Preparer Use Only Firm's Name": "R D Harrison CPA",
          "Paid Preparer Use Only Firm's Address 1": "PO Box 2785",
          "Paid Preparer Use Only Firm's Address 2": "N/A",
          "Paid Preparer Use Only Firm's Address City": "Grapevine",
          "Paid Preparer Use Only Firm's Address State": "TX",
          "Paid Preparer Use Only Firm's Address Zip Code": "76099-2785",
          "Paid Preparer Use Only Phone No.": "210 710-7523",
          "Firm's EIN": "74-2999811",
          "Name(s) Shown On Return": "Samuel C Sotello",
          "Identifying Number": "639-32-1844",
          "Borrower Name": "Samuel C Sotello",
          Field: "Samuel C Sotello",
          "Name Of Proprietor": "Samuel C Sotello",
          "Social Security Number (SSN)": "1844",
          "Principal Crop Or Activity": "Cattle",
          "Enter Code From Part IV": "112111",
          "Accounting Method Cash": "1",
          "Accounting Method Accrual": "0",
          "Employer ID Number (EIN)": "n/A",
          "Did You Materially Participate In The Operation Of This Business During 2023? Yes":
            "1",
          "Did You Materially Participate In The Operation Of This Business During 2023? No":
            "0",
          "Did You Make Any Payments In 2023 That Would Require You To File Form(s) 1099? Yes":
            "1",
          "Did You Make Any Payments In 2023 That Would Require You To File Form(s) 1099? No":
            "0",
          "If Yes Did You Or Will You File Required Form(s) 1099? Yes": "1",
          "If Yes Did You Or Will You File Required Form(s) 1099? No": "0",
          "Sales Of Purchased Livestock And Other Resale Items": "n/A",
          "Cost Or Other Basis Of Purchased Livestock Or Other Items Reported On Line 1A":
            "n/A",
          "Subtract Line 1B From Line 1A": "n/A",
          "Sales Of Livestock Produce Grains And Other Products You Raised":
            "25,159",
          "Cash Method Cooperative Distributions (Form(s) 1099": "n/A",
          "Cash Method Cooperative Distributions Taxable Amount": "n/A",
          "Cash Method Agricultural Program Payments": "n/A",
          "Cash Method Agricultural Program Payments Taxable Amount": "n/A",
          "Commodity Credit Corporation (CCC) Loans Reported Under Election":
            "n/A",
          "CCC Loans Forfeited": "n/A",
          "Cash Method CCC Loans Forfeited Taxable Amount": "n/A",
          "Crop Insurance Proceeds And Federal Crop Disaster Payments Amount received in Year":
            "n/A",
          "Taxable Amount": "n/A",
          "Amount deferred from Year": "n/A",
          "Cash Method Custom Hire (Machine Work) Income": "n/A",
          "Other Income Including Federal And State Gasoline Or Fuel Tax Credit Or Refund":
            "n/A",
          "Cash Method Gross Income": "25,159",
          "Car And Truck Expenses": "n/A",
          Chemicals: "n/A",
          "Conservation Expenses": "n/A",
          "Custom Hire (Machine Work)": "n/A",
          "Depreciation And Section 179 Expense": "4,788",
          "Employee Benefit Programs Other Than On Line 23": "n/A",
          Feed: "11,613",
          "Fertilizers And Lime": "n/A",
          "Freight And Trucking": "n/A",
          "Gasoline Fuel And Oil": "n/A",
          "Insurance (Other Than Health)": "3,403",
          "Interest Mortgage": "n/A",
          "Interest Other": "n/A",
          "Labor Hired (Less Employment Credits)": "272",
          "Pension And Profit Sharing Plans": "n/A",
          "Repairs And Maintenance": "702",
          "Seeds And Plants": "n/A",
          "Storage And Warehousing": "14,615",
          Supplies: "n/A",
          Taxes: "n/A",
          Utilities: "n/A",
          "Veterinary Breeding And Medicine": "448",
          "Total Expenses": "40,641",
          "Net Farm Profit Or (Loss)": "-15,482",
          "Check The Box That Describes Your Investment In This Activity: All investment is at risk":
            "1",
          "Check The Box That Describes Your Investment In This Activity: Some investment is not at risk.":
            "0",
          "Sales Of Livestock Produce Grains And Other Products": "n/A",
          "Accrual Method Cooperative Distributions (Form(s) 1099": "n/A",
          "Accrual Method Cooperative Distributions Taxable Amount": "n/A",
          "Accrual Method Agricultural Program Payments": "n/A",
          "Accrual Method CCC Loans Forfeited": "n/A",
          "Commodity Credit Corporation (CCC) Loans a CCC loans reported under election":
            "n/A",
          "Commodity Credit Corporation (CCC) Loans CCC loans forfeited": "n/A",
          "Commodity Credit Corporation (CCC) Loans Taxable amount": "n/A",
          "Crop Insurance Proceeds": "n/A",
          "Accrual Method Custom Hire (Machine Work) Income": "n/A",
          "Other Income": "n/A",
          "Add Amounts In The Right Column For Lines 37 Through 43 Farm Income Accural Method":
            "n/A",
          "Inventory Of Livestock Produce Grains And Other Products": "n/A",
          "Cost Of Livestock Produce Grains And Other Products Purchased During The Year":
            "n/A",
          "Add Lines 45 And 46 Inventory Of Live Stock and Cost of Live Stock":
            "n/A",
          "Inventory Of Livestock Produce Grains And Other Products At End Of Year":
            "n/A",
          "Cost Of Livestock Produce Grains And Other Products Sold": "n/A",
          "Accrual Method Gross Income": "n/A",
          "If election to defer to 2024 is attached": "n/A",
          "Rent or Lease Vehicle, machinery, equipment": "n/A",
          "Rent or Lease Other (land, animals, etc.)": "n/A",
          "Name(s) Shown On Form 1040 1040-SR Or 1040-NR": "Samuel C Sotello",
          "Taxable Refunds Credits Or Offsets Of State And Local Income Taxes":
            "1",
          "Alimony Received": "n/a",
          "Alimony received - Date Of Original Divorce Or Separation Agreement":
            "n/a",
          "Business Income Or (Loss) Attach Schedule C": "n/a",
          "Other Gains Or (Losses) Attach Form 4797": "n/a",
          "Rental Real Estate Royalties Partnerships S Corporations Trusts Etc. Attach Schedule E":
            "n/a",
          "Farm Income Or (Loss) Attach Schedule F": "-15,482",
          "Unemployment Compensation": "n/a",
          "Other Income Net operating loss": "n/a",
          "Other Income Gambling": "n/a",
          "Other Income Cancellation of debt": "n/a",
          "Other Income Foreign earned income exclusion from Form 2555": "n/a",
          "Other Income from Form 8853": "n/a",
          "Other Income from Form 8889": "n/a",
          "Other Income Alaska Permanent Fund dividends": "n/a",
          "Other Income Jury duty pay": "n/a",
          "Other Income Prizes and awards": "n/a",
          "Other Income Activity not engaged in for profit income": "n/a",
          "Other Income Stock options": "n/a",
          "Other Income from the rental of personal property": "n/a",
          "Other Income Olympic and Paralympic medals and USOC prize money":
            "n/a",
          "Other Income Section 951(a) inclusion": "n/a",
          "Other Income Section 951A(a) inclusion": "n/a",
          "Other Income Section 461(l) excess business loss adjustment": "n/a",
          "Other Income Taxable distributions from an ABLE account": "n/a",
          "Other Income Scholarship and fellowship grants not reported on Form W-2":
            "n/a",
          "Other Income Nontaxable amount of Medicaid waiver payments included on Form 1040 line 1a or 1d":
            "n/a",
          "Other Income Pension or annuity from a nonqualified deferred compensation plan or a nongovernment section 457 plan":
            "n/a",
          "Other Income Wages earned while incarcerated": "n/a",
          "Other Income Digital assets received as ordinary income not reported elsewhere":
            "n/a",
          "Total Other Income Add Lines 8A Through 8Z": "n/a",
          "Combine Lines 1 Through 7 And 9. This is your additional income.":
            "-15,482",
          "Educator Expenses": "n/a",
          "Certain Business Expenses Of Reservists Performing Artists and fee-basis government officials. Attach Form 2106":
            "n/a",
          "Health Savings Account Deduction. Attach Form 8889": "n/a",
          "Moving Expenses For Members Of The Armed Forces. Attach Form 3903":
            "n/a",
          "Deductible Part Of Self-Employment Tax. Attach Schedule SE": "n/a",
          "Self-Employed SEP SIMPLE And Qualified Plans": "n/a",
          "Self-Employed Health Insurance Deduction": "n/a",
          "Penalty On Early Withdrawal Of Savings": "n/a",
          "Alimony Paid": "n/a",
          "Recipient's SSN": "n/a",
          "Alimony Paid - Date Of Original Divorce Or Separation Agreement":
            "n/a",
          "IRA Deduction": "n/a",
          "Student Loan Interest Deduction": "n/a",
          "Archer MSA Deduction": "n/a",
          "Other Adjustments Jury duty pay": "n/a",
          "Other Adjustments Deductible expenses related to income reported on line 8l from the rental of personal property engaged in for profit":
            "n/a",
          "Other Adjustments Nontaxable amount of the value of Olympic and Paralympic medals and USOC prize money reported on line 8m":
            "n/a",
          "Other Adjustments Reforestation amortization and expenses": "n/a",
          "Other Adjustments Repayment of supplemental unemployment benefits under the Trade Act of 1974":
            "n/a",
          "Other Adjustments Contributions to section 501(c)(18)(D) pension plans":
            "n/a",
          "Other Adjustments Contributions by certain chaplains to section 403(b) plans":
            "n/a",
          "Other Adjustments Attorney fees and court costs for actions involving certain unlawful discrimination claims":
            "n/a",
          "Other Adjustments Attorney fees and court costs you paid in connection with an aware from the IRS for information you provided that helped the IRS deduct tax violations":
            "n/a",
          "Other Adjustments Housing deduction from Form 2555": "n/a",
          "Other Adjustments Excess deductions of section 67(e) expenses from Schedule K-1 (Form 1041)":
            "n/a",
          "Total Other Adjustments. Add Lines 24A Through 24Z": "n/a",
          "Add Lines 11 Through 23 And 25. These are your adjustments of income.":
            "n/a",
          "Schedule L Year": "n/a",
          "Assets Cash - Beginning of tax year (b)": "n/a",
          "Assets Cash - End of tax year (d)": "n/a",
          "Assets Trade Notes And Accounts Receivable - Beginning of tax year (a)":
            "n/a",
          "Assets Trade Notes And Accounts Receivable - End of tax year (c)":
            "n/a",
          "Assets Less Allowance For Bad Debts - Beginning of tax year (a)":
            "n/a",
          "Assets Less Allowance For Bad Debts - Beginning of tax year (b)":
            "n/a",
          "Assets Less Allowance For Bad Debts - End of tax year (c)": "n/a",
          "Assets Less Allowance For Bad Debts - End of tax year (d)": "n/a",
          "Assets Inventories - Beginning of tax year (b)": "n/a",
          "Assets Inventories - End of tax year (d)": "n/a",
          "Assets U.S. Government Obligations - Beginning of tax year (b)":
            "n/a",
          "Assets U.S. Government Obligations - End of tax year (d)": "n/a",
          "Assets Tax Exempt Securities - Beginning of tax year (b)": "n/a",
          "Assets Tax Exempt Securities - End of tax year (d)": "n/a",
          "Assets Other Current Assets - Beginning of tax year (b)": "n/a",
          "Assets Other Current Assets - End of tax year (d)": "n/a",
          "Assets Loans To Shareholders - Beginning of tax year (b)": "n/a",
          "Assets Loans To Shareholders - End of tax year (d)": "n/a",
          "Assets Mortgage And Real Estate Loans - Beginning of tax year (b)":
            "n/a",
          "Assets Mortgage And Real Estate Loans - End of tax year (d)": "n/a",
          "Assets Other Investments - Beginning of tax year (b)": "n/a",
          "Assets Other Investments - End of tax year (d)": "n/a",
          "Assets Buildings And Other Depreciable Assets - Beginning of tax year (a)":
            "n/a",
          "Assets Buildings And Other Depreciable Assets - End of tax year (c)":
            "n/a",
          "Assets Less Accumulated Depreciation - Beginning of tax year (a)":
            "n/a",
          "Assets Less Accumulated Depreciation - Beginning of tax year (b)":
            "n/a",
          "Assets Less Accumulated Depreciation - End of tax year (c)": "n/a",
          "Assets Less Accumulated Depreciation - End of tax year (d)": "n/a",
          "Assets Depletable Assets - Beginning of tax year (a)": "n/a",
          "Assets Depletable Assets - End of tax year (c)": "n/a",
          "Assets Less Accumulated Depletion - Beginning of tax year (a)":
            "n/a",
          "Assets Less Accumulated Depletion - Beginning of tax year (b)":
            "n/a",
          "Assets Less Accumulated Depletion - End of tax year (c)": "n/a",
          "Assets Less Accumulated Depletion - End of tax year (d)": "n/a",
          "Assets Land (Net Of Any Amortization) - Beginning of tax year (b)":
            "n/a",
          "Assets Land (Net Of Any Amortization) - End of tax year (d)": "n/a",
          "Assets Intangible Assets (Amortizable Only) - Beginning of tax year (a)":
            "n/a",
          "Assets Intangible Assets (Amortizable Only) - Beginning of tax year (b)":
            "n/a",
          "Assets Less Accumulated Amortization - Beginning of tax year (a)":
            "n/a",
          "Assets Less Accumulated Amortization - Beginning of tax year (b)":
            "n/a",
          "Assets Less Accumulated Amortization - End of tax year (c)": "n/a",
          "Assets Less Accumulated Amortization - End of tax year (d)": "n/a",
          "Assets Other Assets - Beginning of tax year (b)": "n/a",
          "Assets Other Assets - End of tax year (d)": "n/a",
          "Assets Total Assets - Beginning of tax year (b)": "n/a",
          "Assets Total Assets - End of tax year (d)": "n/a",
          "Liabilities and Shareholders' Equity Accounts Payable - Beginning of tax year (b)":
            "n/a",
          "Liabilities and Shareholders' Equity Accounts Payable - End of tax year (d)":
            "n/a",
          "Liabilities and Shareholders' Equity Mortgages Notes Bonds Payable In Less Than 1 Year - Beginning of tax year (b)":
            "n/a",
          "Liabilities and Shareholders' Equity Mortgages Notes Bonds Payable In Less Than 1 Year - End of tax year (d)":
            "n/a",
          "Liabilities and Shareholders' Equity Other Current Liabilities - Beginning of tax year (b)":
            "n/a",
          "Liabilities and Shareholders' Equity Other Current Liabilities - End of tax year (d)":
            "n/a",
          "Liabilities and Shareholders' Equity Loans From Shareholders - Beginning of tax year (b)":
            "n/a",
          "Liabilities and Shareholders' Equity Loans From Shareholders - End of tax year (d)":
            "n/a",
          "Liabilities and Shareholders' Equity Mortgages Notes Bonds Payable In 1 Year Or More - Beginning of tax year (b)":
            "n/a",
          "Liabilities and Shareholders' Equity Mortgages Notes Bonds Payable In 1 Year Or More - End of tax year (d)":
            "n/a",
          "Liabilities and Shareholders' Equity Other Liabilities - Beginning of tax year (b)":
            "n/a",
          "Liabilities and Shareholders' Equity Other Liabilities - End of tax year (d)":
            "n/a",
          "Liabilities and Shareholders' Equity Capital Stock A Preferred Stock - Beginning of tax year (a)":
            "n/a",
          "Liabilities and Shareholders' Equity Capital Stock A Preferred Stock - Beginning of tax year (b)":
            "n/a",
          "Liabilities and Shareholders' Equity Capital Stock B Common Stock - Beginning of tax year (a)":
            "n/a",
          "Liabilities and Shareholders' Equity Capital Stock B Common Stock- Beginning of tax year (b)":
            "n/a",
          "Liabilities and Shareholders' Equity Capital Stock B Common Stock - End of tax year (c)":
            "n/a",
          "Liabilities and Shareholders' Equity Capital Stock B Common Stock - End of tax year (d)":
            "n/a",
          "Liabilities and Shareholders' Equity Additional Paid In Capital - Beginning of tax year (b)":
            "n/a",
          "Liabilities and Shareholders' Equity Additional Paid In Capital - End of tax year (d)":
            "n/a",
          "Liabilities and Shareholders' Equity Retained Earnings Appropriated - Beginning of tax year (b)":
            "n/a",
          "Liabilities and Shareholders' Equity Retained Earnings Appropriated - End of tax year (d)":
            "n/a",
          "Liabilities and Shareholders' Equity Retained Earnings Unappropriated - Beginning of tax year (b)":
            "n/a",
          "Liabilities and Shareholders' Equity Retained Earnings Unappropriated - End of tax year (d)":
            "n/a",
          "Liabilities and Shareholders' Equity Adjustments To Shareholders' Equity - Beginning of tax year (b)":
            "n/a",
          "Liabilities and Shareholders' Equity Adjustments To Shareholders' Equity - End of tax year (d)":
            "n/a",
          "Liabilities and Shareholders' Equity Less Cost Of Treasury Stock - Beginning of tax year (b)":
            "n/a",
          "Liabilities and Shareholders' Equity Less Cost Of Treasury Stock - End of tax year (d)":
            "n/a",
          "Liabilities and Shareholders' Equity Total Liabilities And Shareholders' Equity - Beginning of tax year (b)":
            "n/a",
          "Liabilities and Shareholders' Equity Total Liabilities And Shareholders' Equity - End of tax year (d)":
            "n/a",
          "M-1 Net Income (Loss) Per Books": "n/a",
          "Federal Income Tax Per Books": "n/a",
          "Excess Of Capital Losses Over Capital Gains": "n/a",
          "Income Subject To Tax Not Recorded On Books This Year Description":
            "n/a",
          "Income Subject To Tax Not Recorded On Books This Year Amount": "n/a",
          "Expenses Depreciation": "n/a",
          "Expenses Charitable Contributions": "n/a",
          "Travel And Entertainment Description": "n/a",
          "Travel And Entertainment Amount": "n/a",
          "Income Recorded On Books This Year Not Included On This Return Description":
            "n/a",
          "Add Lines 1 Through 5 Net Income(loss),Federal income tax per books, Excess of capital losses over capital gains, income subject to tax not recorded on books, and Expenses recorded on books this year not deducted":
            "n/a",
          "Income Recorded On Books This Year Not Included On This Return Amount":
            "n/a",
          "Deductions Depreciation": "n/a",
          "Deductions Charitable Contributions Description": "n/a",
          "Deductions Charitable Contributions Amount": "n/a",
          "Add Lines 7 And 8 Income recorded on books not included on this return and deductions on this return not charged against book income this year":
            "n/a",
          Income: "n/a",
          "Balance At Beginning Of Year": "n/a",
          "M-2 Net Income (Loss) Per Books": "n/a",
          "Other Increases (Itemize) Description": "n/a",
          "Other Increases (Itemize) Amount": "n/a",
          "Add Lines 1, 2 And 3 Balance at beginning of year, Net Income(loss) per books, Other Increases":
            "n/a",
          "Distributions Cash": "n/a",
          "Distributions Stock": "n/a",
          "Distributions Property": "n/a",
          "Other Decreases (Itemize) Description": "n/a",
          "Other Decreases (Itemize) Amount": "n/a",
          "Add Lines 5 And 6 Distributions and Other Decreases": "n/a",
          "Balance At End Of Year (Line 4 Less Line 7)": "n/a",
          "Statement Number": "n/a",
          "Form Number": "n/a",
          "Total Deductions": "n/a",
          Title:
            "2-Income- 1040 ~ IC_LOAN_50490 1501581799_0S2YHTK5RUF4GIGJEW9MG4B1_DCA_430.pdf",
          Url: "https://cabmststr001.blob.core.windows.net/filedrive/d76d720736a702accac1326fab95475e?time=638916269554697781",
          StageName: "Exported",
          GeneratedOn: "2025-08-24T10:31:41.839171Z",
        },
      ],
      VVOE: [
        {
          "Borrower Name": "Samuel Sotello",
          "Employer Name": "Sotello Electric LLC",
          "Employer Phone": "(830) 570-1970",
          "Borrower's Employment Status": "Active",
          "Borrower's Job Title": "electrician",
          "Employed For (Years)": "8/2011",
          "Date of Hire": "8/2011",
          "Verified By Name": "Michelle Lukas",
          "Verifier's Title": "Loan Processor",
          Signature: "Michelle Lukas",
          "Verified Date": "5/20/2025",
          Title:
            "2-Income- VVOE ~ IC_LOAN_50490 1501581799_0S2YHTK5RUF4GIGJEW9MG4B1_DCA_430.pdf",
          Url: "https://cabmststr001.blob.core.windows.net/filedrive/9d1744f408bb5b4d636484d17d6defb7?time=638916269554697502",
          StageName: "Exported",
          GeneratedOn: "2025-08-24T10:32:03.3290109Z",
        },
      ],
      VOE: [
        {
          "Borrower Name": "Samuel Cameron Sotello",
          "Social Security Number": "5790",
          "Employee Name": "Samuel Cameron Sotello",
          "Employee Address 1": "1658 Tessman Rd",
          "Employee Address 2": "Pleasanton, TX 78065",
          "Employee Address City": "Pleasanton",
          "Employee Address State": "TX",
          "Employee Address Zip Code": "78065",
          "Employer/Company Name": "Sotello Electric, LLC",
          "Employer Address 1": "1306 N Main St",
          "Employer Address 2": "Pleasanton, TX 78064",
          "Employer Address City": "Pleasanton",
          "Employer Address State": "TX",
          "Employer Address Zip Code": "78064",
          "Verified On or WVOE Thru Date": "5/8/2025",
          "Employment Status": "Active",
          "Most Recent Start Date": "8/2011",
          "Original Hire Date": "n/A",
          "Present Position": "Electrician",
          "Rate Of Pay Amount": "46",
          "Type Name": "n/A",
          "Rate Of Pay Frequency": "Hourly",
          "Average Hours Per Pay Period": "40-45",
          "Gross Base Pay": "n/A",
          "Amount Of Last Pay Increase": "6",
          "Amount of Next Pay Increase": "5.00",
          "Date Of Applicants Last Increase": "9-2024",
          "Date of Applicants Next Increase": "7-2025",
          "Year 1": "2023",
          "Base Salary 1": "43,380",
          "Overtime 1": "5,380",
          "Commission 1": "n/A",
          "Bonus 1": "n/A",
          "Other Income 1": "n/A",
          "Total Pay 1": "95,920",
          "Year 2": "2022",
          "Base Salary 2": "89,746",
          "Overtime 2": "9,028",
          "Commission 2": "n/A",
          "Bonus 2": "n/A",
          "Other Income 2": "n/A",
          "Total Pay 2": "95,674",
          "Year 3": "2021",
          "Base Pay 3": "35,745",
          "Overtime 3": "n/A",
          "Commission 3": "n/A",
          "Bonuses 3": "n/A",
          "Other Income 3": "n/A",
          "Total Pay 3": "35,745",
          "Remarks (If Employee Was Off Work For Any Length Of Time)": "n/A",
          "Date Hired (Previous Employment)": "n/A",
          "Date Terminated (Previous Employment)": "n/A",
          "Salary/Wage At Termination Per (Time Period)": "n/A",
          "Salary/Wage At Termination - Base (Previous Employment)": "n/A",
          "Salary/Wage At Termination - Overtime (Previous Employment)": "n/A",
          "Salary/Wage At Termination - Commissions": "n/A",
          "Salary/Wage At Termination - Bonus": "n/A",
          "Reason For Leaving": "n/A",
          "Position Held": "n/A",
          "Signature Of Employer": "Signed",
          "Signature Date": "5/7/2025",
          "From (Name Of Lender)": "Shelby Menges",
          "From (Address Of Lender)": "1270 North Loop 1604 East Suite 1101",
          "Signature Of Lender": "Shelby Menges",
          Title:
            "3-Income- WVOE ~ IC_LOAN_50490 1501581799_0S2YHTK5RUF4GIGJEW9MG4B1_DCA_430.pdf",
          Date: "5/8/2025",
          "Lender's Number (Optional)": "4401250467990",
          "Badge Number": "n/A",
          "Signature Of Applicant": "n/A",
          "Probability Of Continued Employment": "n/A",
          "Base Salary 3": "n/A",
          "Bonus 3": "n/A",
          "For Military Personnel Only  Pay Grade": "n/A",
          "For Military Personnel Only (Type)  Base Pay": "n/A",
          "For Military Personnel Only (Type)  Rations": "n/A",
          "For Military Personnel Only (Type) Flight Or Hazard": "n/A",
          "For Military Personnel Only (Type)  Clothing": "n/A",
          Url: "https://cabmststr001.blob.core.windows.net/filedrive/97fca1754f40438d0590209f42eb418e?time=638916269554697300",
          StageName: "Exported",
          GeneratedOn: "2025-08-24T10:31:57.9081101Z",
        },
      ],
      Paystubs: [
        {
          "Borrower Name": "SAMUEL CAMERON SOTELLO",
          "Employer Name": "PILGRIM MORTGAGE LLC",
          "Employer Address 1": "1270 N LOOP 1604 E",
          "Employer Address 2": "n/A",
          "Employer Address City": "SAN ANTONIO",
          "Employer Address State": "TX",
          "Employer Address Zip Code": "78232",
          "Employee Name": "SAMUEL CAMERON SOTELLO",
          "Marital Status": "n/A",
          "Type of ID": "n/A",
          "Employee Address 1": "1658 TESSMAN RD",
          "Employee Address 2": "n/A",
          "Employee Address City": "PLEASANTON",
          "Employee Address State": "TX",
          "Employee Address Zip Code": "78065",
          "Paystub Provider": "n/A",
          "Date of Hire": "n/A",
          "Pay Period Start Date": "n/A",
          "Pay Period End Date": "n/A",
          "Pay Date": "n/A",
          "Actual Pay Frequency": "n/A",
          "Total Earnings for Current Period": "n/A",
          "Total Year to Date Earnings": "n/A",
          "Annual salary": "n/A",
          "Pay Basis": "n/A",
          "Net pay amount": "n/A",
          "Total Deductions": "n/A",
          "Total Year to Date Deductions": "n/A",
          Title:
            "7-Income- Paystub ~ IC_LOAN_50490 1501581799_0S2YHTK5RUF4GIGJEW9MG4B1_DCA_430.pdf",
          Url: "https://cabmststr001.blob.core.windows.net/filedrive/85365efea65eb5b737dc0ba11938bb3b?time=638916269554697905",
          StageName: "Exported",
          GeneratedOn: "2025-08-24T10:31:52.4532768Z",
        },
      ],
    },
    "NATALIE EDEN SOTELLO": {
      Paystubs: [
        {
          "Borrower Name": "NATALIE EDEN SOTELLO",
          "Employer Name": "PILGRIM MORTGAGE LLC",
          "Employer Address 1": "1270 N LOOP 1604 E",
          "Employer Address 2": "N/A",
          "Employer Address City": "SAN ANTONIO",
          "Employer Address State": "TX",
          "Employer Address Zip Code": "78232",
          "Employee Name": "NATALIE EDEN SOTELLO",
          "Marital Status": "N/A",
          "Type of ID": "N/A",
          "Employee Address 1": "1658 TESSMAN RD",
          "Employee Address 2": "N/A",
          "Employee Address City": "PLEASANTON",
          "Employee Address State": "TX",
          "Employee Address Zip Code": "78065",
          "Paystub Provider": "N/A",
          "Date of Hire": "N/A",
          "Pay Period Start Date": "N/A",
          "Pay Period End Date": "N/A",
          "Pay Date": "N/A",
          "Actual Pay Frequency": "N/A",
          "Total Earnings for Current Period": "N/A",
          "Total Year to Date Earnings": "N/A",
          "Annual salary": "N/A",
          "Pay Basis": "N/A",
          "Net pay amount": "N/A",
          "Total Deductions": "N/A",
          "Total Year to Date Deductions": "N/A",
          Title:
            "6-Income- Paystub ~ IC_LOAN_50490 1501581799_0S2YHTK5RUF4GIGJEW9MG4B1_DCA_430.pdf",
          Url: "https://cabmststr001.blob.core.windows.net/filedrive/cd7854060d503ca0881ab1247fb1df09?time=638916269554697982",
          StageName: "Exported",
          GeneratedOn: "2025-08-24T10:31:56.6620384Z",
        },
      ],
    },
    "Natalie E Carrasco": {
      W2: [
        {
          Year: "2023",
          "Employee Social Security Number": "0560",
          "Employer ID No. (EIN": "22-3752540",
          "Wages Tips Other Comp": "76602.34",
          "Federal Income Tax Withheld": "9112.92",
          "Social Security Wages": "81527.81",
          "Social Security Tax Withheld": "5054.72",
          "Medicare Wages And Tips": "81527.81",
          "Medicare Tax Withheld": "1182.15",
          "Employer Name": "SKANSKA USA BUILDING INC",
          "Employer Address 1": "5TH FLOOR",
          "Employer Address 2": "389 INTERPACE PARKWAY",
          "Employer Address City": "PARSIPPANY",
          "Employer Address State": "NJ",
          "Employer Address Zip Code": "07054-1132",
          "Employee Name": "NATALIE E CARRASCO",
          "Employee Address 1": "5380 GRANATO RD",
          "Employee Address 2": "n/A",
          "Employee Address City": "POTEET",
          "Employee Address State": "TX",
          "Employee Address Zip Code": "78065",
          "Social Security Tips": "n/A",
          "Allocated Tips": "n/A",
          "Dependent Care Benefits": "n/A",
          "Nonqualified Plans": "n/A",
          "Code Description 1": "D",
          "Code Amount 1": "4925.47",
          "Code Description 2": "C",
          "Code Amount 2": "59.36",
          "Code Description 3": "n/A",
          "Code Amount 3": "n/A",
          "Code Description 4": "n/A",
          "Code Amount 4": "n/A",
          "Statutory Employee": "Unchecked",
          "Retirement Plan": "Unchecked",
          "Third-Party Sick Pay": "Unchecked",
          "State Primary": "n/A",
          "State Secondary": "n/A",
          "Employer state ID Number Primary": "n/A",
          "Employer state ID Number Secondary": "n/A",
          "State Wages Tips Primary": "n/A",
          "State Wages Tips Secondary": "n/A",
          "State Income Tax Primary": "n/A",
          "State Income Tax Secondary": "n/A",
          "Local Wages Tips Primary": "n/A",
          "Local Wages Tips Secondary": "n/A",
          "Local Income Tax Primary": "n/A",
          "Local Income Tax Secondary": "n/A",
          "Locality Name Primary": "n/A",
          "Locality Name Secondary": "n/A",
          Title:
            "4-Income- W2 ~ IC_LOAN_50490 1501581799_0S2YHTK5RUF4GIGJEW9MG4B1_DCA_430.pdf",
          Url: "https://cabmststr001.blob.core.windows.net/filedrive/f613516f91faf07dd44c323add6bd95c?time=638916269554698461",
          StageName: "Exported",
          GeneratedOn: "2025-08-24T10:32:11.353075Z",
        },
        {
          Year: "2024",
          "Employee Social Security Number": "0560",
          "Employer ID No. (EIN": "22-3752540",
          "Wages Tips Other Comp": "69121.88",
          "Federal Income Tax Withheld": "8962.96",
          "Social Security Wages": "70325.72",
          "Social Security Tax Withheld": "4360.19",
          "Medicare Wages And Tips": "70325.72",
          "Medicare Tax Withheld": "1019.72",
          "Employer Name": "SKANSKA USA BUILDING INC",
          "Employer Address 1": "5TH FLOOR",
          "Employer Address 2": "389 INTERPACE PARKWAY",
          "Employer Address City": "PARSIPPANY",
          "Employer Address State": "NJ",
          "Employer Address Zip Code": "07054-1132",
          "Employee Name": "NATALIE E CARRASCO",
          "Employee Address 1": "5380 GRANADO RD",
          "Employee Address 2": "n/A",
          "Employee Address City": "POTEET",
          "Employee Address State": "TX",
          "Employee Address Zip Code": "78065",
          "Social Security Tips": "70325.72",
          "Allocated Tips": "n/A",
          "Dependent Care Benefits": "n/A",
          "Nonqualified Plans": "1203.84",
          "Code Description 1": "C",
          "Code Amount 1": "49.84",
          "Code Description 2": "AA",
          "Code Amount 2": "1403.46",
          "Code Description 3": "n/A",
          "Code Amount 3": "n/A",
          "Code Description 4": "n/A",
          "Code Amount 4": "n/A",
          "Statutory Employee": "Unchecked",
          "Retirement Plan": "Checked",
          "Third-Party Sick Pay": "Unchecked",
          "State Primary": "n/A",
          "State Secondary": "n/A",
          "Employer state ID Number Primary": "n/A",
          "Employer state ID Number Secondary": "n/A",
          "State Wages Tips Primary": "n/A",
          "State Wages Tips Secondary": "n/A",
          "State Income Tax Primary": "n/A",
          "State Income Tax Secondary": "n/A",
          "Local Wages Tips Primary": "n/A",
          "Local Wages Tips Secondary": "n/A",
          "Local Income Tax Primary": "n/A",
          "Local Income Tax Secondary": "n/A",
          "Locality Name Primary": "n/A",
          "Locality Name Secondary": "n/A",
          Title:
            "5-Income- W2 ~ IC_LOAN_50490 1501581799_0S2YHTK5RUF4GIGJEW9MG4B1_DCA_430.pdf",
          Url: "https://cabmststr001.blob.core.windows.net/filedrive/0011bd83d22bdc6626636235b42148b6?time=638916269554698386",
          StageName: "Exported",
          GeneratedOn: "2025-08-24T10:32:14.0086481Z",
        },
      ],
      VOE: [
        {
          "Borrower Name": "Natalie E Carrasco",
          "Social Security Number": "XXX-XX-0560",
          "Employee Name": "Natalie E Carrasco",
          "Employer/Company Name": "Skanska USA Inc.",
          "Employer Address 1": "389 Interpace Parkway",
          "Employer Address 2": "5th Floor",
          "Employer Address City": "Parsippany",
          "Employer Address State": "NJ",
          "Employer Address Zip Code": "07054",
          "Employment Status": "Not Currently on Payroll",
          "Most Recent Start Date": "05/10/2021",
          "Original Hire Date": "05/10/2021",
          "Present Position": "Senior Project Engineer",
          "Rate Of Pay Amount": "$86500.0 Annual",
          "Rate Of Pay Frequency": "Biweekly",
          "Average Hours Per Pay Period": "n/A",
          "Amount Of Last Pay Increase": "n/A",
          "Amount of Next Pay Increase": "n/A",
          "Date Of Applicants Last Increase": "n/A",
          "Date of Applicants Next Increase": "n/A",
          "Year 1": "2024YTD",
          "Base Salary 1": "$57436",
          "Overtime 1": "$0",
          "Commission 1": "n/A",
          "Bonus 1": "$6331.85",
          "Other Income 1": "$0",
          "Total Pay 1": "$63767.85",
          "Year 2": "2023",
          "Base Salary 2": "$74491",
          "Overtime 2": "$0",
          "Commission 2": "n/A",
          "Bonus 2": "$6976.07",
          "Other Income 2": "$0",
          "Total Pay 2": "$81467.07",
          "Year 3": "2022",
          "Base Pay 3": "$69758",
          "Overtime 3": "$0",
          "Commission 3": "n/A",
          "Bonuses 3": "$4022.56",
          "Other Income 3": "$0",
          "Total Pay 3": "$73808.56",
          "Base Salary 3": "n/A",
          "Bonus 3": "n/A",
          "Reference Number": "4401250467990",
          "Date Last Updated": "5/5/2025 12:58 PM",
          "Verification Type": "Employment plus Income",
          "Permissible Purpose": "Employee's application for credit",
          "Employer Disclaimer":
            "employer.Severance pay information (if applicable) is not included in this report. Please contact employer.verification@skanska.com if severance pay information is required. Rate of pay is a calculated field whereby Skanska has divided the gross regular pay by the hours worked. This is a global message and is provided on every verification for your information and convenience. Garnishment requests should be sent to: Skanska",
          "Division Number": "Building",
          "Employment End Date": "09/27/2024",
          "Total Time With Employer": "3 years, 5 months",
          "On Next Leave Dates": "n/A",
          "On Last Leave Dates": "n/A",
          Title:
            "2-Income- WVOE ~ IC_LOAN_50490 1501581799_0S2YHTK5RUF4GIGJEW9MG4B1_DCA_430.pdf",
          Url: "https://cabmststr001.blob.core.windows.net/filedrive/c46c97996bc0d0d48af22f9b31e900b1?time=638916269554697363",
          StageName: "Exported",
          GeneratedOn: "2025-08-24T10:32:21.8456647Z",
        },
      ],
    },
    "Natalie Carrasco Sotello": {
      W2: [
        {
          Year: "2024",
          "Employee Social Security Number": "0560",
          "Employer ID No. (EIN": "75-2686888",
          "Wages Tips Other Comp": "19973.59",
          "Federal Income Tax Withheld": "1404.83",
          "Social Security Wages": "28873.59",
          "Social Security Tax Withheld": "1294.16",
          "Medicare Wages And Tips": "28873.59",
          "Medicare Tax Withheld": "302.67",
          "Employer Name": "Stream Realty Partners, L.P.",
          "Employer Address 1": "2001 Ross Ave",
          "Employer Address 2": "Suite 400",
          "Employer Address City": "Dallas",
          "Employer Address State": "TX",
          "Employer Address Zip Code": "75201",
          "Employee Name": "Natalie Carrasco Sotello",
          "Employee Address 1": "5388 Granato Rd",
          "Employee Address 2": "n/A",
          "Employee Address City": "Poteet",
          "Employee Address State": "TX",
          "Employee Address Zip Code": "78065",
          "Social Security Tips": "0.00",
          "Allocated Tips": "0.00",
          "Dependent Care Benefits": "0.00",
          "Nonqualified Plans": "0.00",
          "Code Description 1": "D",
          "Code Amount 1": "900.00",
          "Code Description 2": "DD",
          "Code Amount 2": "4108.39",
          "Code Description 3": "W",
          "Code Amount 3": "668.75",
          "Code Description 4": "n/A",
          "Code Amount 4": "n/A",
          "Statutory Employee": "Checked",
          "Retirement Plan": "Unchecked",
          "Third-Party Sick Pay": "Unchecked",
          "State Primary": "n/A",
          "State Secondary": "n/A",
          "Employer state ID Number Primary": "n/A",
          "Employer state ID Number Secondary": "n/A",
          "State Wages Tips Primary": "n/A",
          "State Wages Tips Secondary": "n/A",
          "State Income Tax Primary": "n/A",
          "State Income Tax Secondary": "n/A",
          "Local Wages Tips Primary": "n/A",
          "Local Wages Tips Secondary": "n/A",
          "Local Income Tax Primary": "n/A",
          "Local Income Tax Secondary": "n/A",
          "Locality Name Primary": "n/A",
          "Locality Name Secondary": "n/A",
          Title:
            "3-Income- W2 ~ IC_LOAN_50490 1501581799_0S2YHTK5RUF4GIGJEW9MG4B1_DCA_430.pdf",
          Url: "https://cabmststr001.blob.core.windows.net/filedrive/bf95c9ffd2a5e1a6ff0a964da27a3f81?time=638916269554698525",
          StageName: "Exported",
          GeneratedOn: "2025-08-24T10:32:16.8990599Z",
        },
      ],
      VVOE: [
        {
          "Borrower Name": "Natalie Carrasco Sotello",
          "Employer Name": "Stream Realty Partners L.P",
          "Borrower's Employment Status": "Active",
          "Borrower's Job Title": "Project Coordinator, Construction",
          "Employed For (Years)": "NaN years, NaN months",
          "Date of Hire": "09/30/2024",
          Title:
            "1-Income- VVOE ~ IC_LOAN_50490 1501581799_0S2YHTK5RUF4GIGJEW9MG4B1_DCA_430.pdf",
          Url: "https://cabmststr001.blob.core.windows.net/filedrive/474260e906bca01b5c42e49fc13c4a49?time=638916269554697565",
          StageName: "Exported",
          GeneratedOn: "2025-08-24T10:32:17.6177253Z",
        },
      ],
    },
    "NATHALIE CARRASCO SOTELLO": {
      Paystubs: [
        {
          "Borrower Name": "NATHALIE CARRASCO SOTELLO",
          "Employer Name": "Stream Realty Personnel Services, LLC",
          "Employer Address 1": "2001 Ross Ave",
          "Employer Address 2": "Suite 400",
          "Employer Address City": "Dallas",
          "Employer Address State": "TX",
          "Employer Address Zip Code": "75201",
          "Employee Name": "NATHALIE CARRASCO SOTELLO",
          "Marital Status": "n/A",
          "Type of ID": "XXXX-XXXX-6789",
          "Employee Address 1": "5706 GRANITE RD",
          "Employee Address 2": "n/A",
          "Employee Address City": "FORT WORTH",
          "Employee Address State": "TX",
          "Employee Address Zip Code": "76105",
          "Paystub Provider": "UKG",
          "Date of Hire": "n/A",
          "Pay Period Start Date": "04/11/2023",
          "Pay Period End Date": "04/15/2023",
          "Pay Date": "04/15/2023",
          "Actual Pay Frequency": "Semi-Monthly",
          "Total Earnings for Current Period": "$3,850.74",
          "Total Year to Date Earnings": "$17,755.43",
          "Annual salary": "n/A",
          "Pay Basis": "Salary",
          "Net pay amount": "$2,630.16",
          "Total Deductions": "$720.29",
          "Total Year to Date Deductions": "$3,545.63",
          Title:
            "1-Income- Paystub ~ IC_LOAN_50490 1501581799_0S2YHTK5RUF4GIGJEW9MG4B1_DCA_430.pdf",
          Url: "https://cabmststr001.blob.core.windows.net/filedrive/bc735d96aaf4da19089a38d0e2bdab14?time=638916269554698323",
          StageName: "Exported",
          GeneratedOn: "2025-08-24T10:32:23.4603156Z",
        },
        {
          "Borrower Name": "NATHALIE CARRASCO SOTELLO",
          "Employer Name": "Stream Realty Personnel Services, LLC",
          "Employer Address 1": "2001 Ross Ave",
          "Employer Address 2": "Suite 400",
          "Employer Address City": "Dallas",
          "Employer Address State": "TX",
          "Employer Address Zip Code": "75201",
          "Employee Name": "NATHALIE CARRASCO SOTELLO",
          "Marital Status": "N/A",
          "Type of ID": "XXXX8484",
          "Employee Address 1": "5706 GARRIDO RD",
          "Employee Address 2": "N/A",
          "Employee Address City": "Austin",
          "Employee Address State": "TX",
          "Employee Address Zip Code": "78745",
          "Paystub Provider": "UKG",
          "Date of Hire": "N/A",
          "Pay Period Start Date": "04/16/2023",
          "Pay Period End Date": "04/16/2023",
          "Pay Date": "2023-04-20",
          "Actual Pay Frequency": "Semi-Monthly",
          "Total Earnings for Current Period": "346.14",
          "Total Year to Date Earnings": "21562.41",
          "Annual salary": "N/A",
          "Pay Basis": "Salary",
          "Net pay amount": "2430.43",
          "Total Deductions": "77.54",
          "Total Year to Date Deductions": "946.02",
          Title:
            "4-Income- Paystub ~ IC_LOAN_50490 1501581799_0S2YHTK5RUF4GIGJEW9MG4B1_DCA_430.pdf",
          Url: "https://cabmststr001.blob.core.windows.net/filedrive/db6dc64726c78b01b892352d3964c6ce?time=638916269554698124",
          StageName: "Exported",
          GeneratedOn: "2025-08-24T10:32:24.8202352Z",
        },
      ],
    },
    Sotello: {
      Paystubs: [
        {
          "Borrower Name": "Sotello, Cameron",
          "Employer Name": "Sotello Electric, LLC",
          "Employer Address 1": "Samuel C. Sotello",
          "Employer Address 2": "n/A",
          "Employer Address City": "n/A",
          "Employer Address State": "n/A",
          "Employer Address Zip Code": "n/A",
          "Employee Name": "Sotello, Cameron",
          "Marital Status": "n/A",
          "Type of ID": "1844",
          "Employee Address 1": "n/A",
          "Employee Address 2": "n/A",
          "Employee Address City": "n/A",
          "Employee Address State": "n/A",
          "Employee Address Zip Code": "n/A",
          "Paystub Provider": "n/A",
          "Date of Hire": "n/A",
          "Pay Period Start Date": "Apr 11, 2025",
          "Pay Period End Date": "Apr 17, 2025",
          "Pay Date": "2025-04-18",
          "Actual Pay Frequency": "n/A",
          "Total Earnings for Current Period": "1,840.00",
          "Total Year to Date Earnings": "33,580.00",
          "Annual salary": "n/A",
          "Pay Basis": "n/A",
          "Net pay amount": "1,712.33",
          "Total Deductions": "n/A",
          "Total Year to Date Deductions": "n/A",
          Title:
            "2-Income- Paystub ~ IC_LOAN_50490 1501581799_0S2YHTK5RUF4GIGJEW9MG4B1_DCA_430.pdf",
          Url: "https://cabmststr001.blob.core.windows.net/filedrive/454ff6e460279eb46246609e2beedaec?time=638916269554698248",
          StageName: "Exported",
          GeneratedOn: "2025-08-24T10:32:19.4117572Z",
        },
      ],
    },
  };

  const menuItems = [
    ...new Set(
      Object.values(rawData).flatMap((borrowerDocs) =>
        Object.keys(borrowerDocs)
      )
    ),
  ];

  // Step 2: Get docs for selected category across all borrowers
  const documents = Object.entries(rawData).flatMap(
    ([borrower, borrowerDocs]) =>
      borrowerDocs[selectedCategory]
        ? borrowerDocs[selectedCategory].map((doc) => ({
            borrower,
            ...doc,
          }))
        : []
  );

  const OpenRulesModel = () => {
    setRulesModel(true);
  };

  const HandleProcess = () => {
    setShowSection((prev) => ({
      ...prev,
      processLoanSection: false,
      provideLoanIDSection: false,
      extractedSection: false,
      uploadedModel: false,
      startAnalyzing: true,
    }));
  };

  return (
    <div>
      <>
        <div className="flex justify-between items-center rounded-lg  pb-3">
          {/* Left side: filename */}
          <span className="font-medium">
            Upload & Extract Files {sessionStorage.getItem("loanId") || ""}
          </span>
          {isUploaded?.uploaded && (
            <div className="flex gap-2">
              <Button
                variant="upload-doc"
                width={200}
                label={"Upload Documents"}
                onClick={() =>
                  setShowSection((prev) => ({ ...prev, uploadedModel: true }))
                }
              />
              <Button
                variant="start-analyze"
                width={200}
                label={"Start Analyzing"}
                onClick={HandleProcess}
              />
            </div>
          )}
        </div>

        {/* <div className="flex border-t border-gray-300 max-h-[calc(100vh-80px)] ">
                    <div className="w-[30%] border-r border-gray-300 p-2 overflow-y-auto">
                        <p className="font-semibold mb-2 text-[#26a3dd]">Loan Package</p>
                        <ul>
                            {menuItems.map((item) => (
                                <li
                                    key={item}
                                    onClick={() => setSelected(item)}
                                    className={`p-2 cursor-pointer border-b  hover:bg-gray-50
                                            ${item === selected
                                            ? "border-l-4 border-[#26a3dd] font-medium bg-gray-100 rounded-r-md"
                                            : "border-gray-200"
                                        }
                                    `}
                                >
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="w-[70%] p-2 space-y-3 ">
                        <div className="space-y-4 h-[400px] overflow-y-auto">
                            {documents.map((doc, idx) => (
                                <div
                                    key={idx}
                                    className="border border-gray-200 rounded-lg shadow-sm bg-white"
                                >
                                    <div className="flex  items-center gap-[30px] font-medium p-2 bg-gray-100 rounded-t-lg cursor-pointer">
                                        <span className="text-gray-800">{doc.title}</span>
                                        <span className="text-sm text-gray-500">
                                            {doc.fieldCount} Fields Extracted
                                        </span>
                                    </div>
                                    <table className="w-full text-left text-sm">
                                        <tbody>
                                            <tr className="border-t bg-gray-100 border-gray-200">
                                                <td className="p-2">Fields</td>
                                                <td className="p-2">Value</td>
                                            </tr>

                                            {doc.fields.map((field, i) => (
                                                <tr key={i} className="border-t border-gray-200">
                                                    <td className="p-2 font-semibold">{field.label}</td>
                                                    <td className="p-2">{field.value}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ))}
                        </div>
                    </div>
                </div> */}
        {isUploaded?.uploaded ? (
          <LoanPackagePanel
            menuItems={menuItems}
            documents={documents}
            setSelectedCategory={setSelectedCategory}
            selectedCategory={selectedCategory}
          />
        ) : (
          <UnuploadedScreen setShowSection={setShowSection} />
        )}

        {/* */}

        {/* <div> */}
        <div className="fixed bottom-4 right-4 flex items-center justify-center w-[50px] h-[50px] rounded-3xl bg-[#12699D] shadow-lg cursor-pointer">
          <DescriptionIcon onClick={OpenRulesModel} className="text-white" />
        </div>

        <UnderwritingRulesModel
          rulesModel={rulesModel}
          OpenRulesModel={setRulesModel}
        />

        {/* </div> */}

        {/* {(<>
                    <div className="flex items-center justify-center border-t border-gray-300 max-h-[calc(100vh-80px)]">
                        <div className="flex items-center justify-center flex-col gap-5 mt-30">
                            <span className="text-gray-400 text-small">No documents yet, Upload to start Extracting.</span>
                            <Button width={200} variant="upload-document" label={'Upload Documents'} />
                        </div>
                    </div>
                </>)} */}
      </>
      {showSection.uploadedModel && (
        <UploadedModel setShowSection={setShowSection} />
      )}
    </div>
  );
};

export default LoanExatraction;
