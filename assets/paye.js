document.querySelector("#calculate").addEventListener("click", (e) => {
    e.preventDefault();
    let nssf = document.querySelector('input[name="deduct_nssf"]:checked').value;
    let nhif = document.querySelector('input[name="deduct_nhif"]:checked').value;
    let pay_period = document.querySelector('input[name="pay_period"]:checked').value;
    let nssf_rates = document.querySelector('input[name="nssf_rates"]:checked').value;
    let basic_salary = document.querySelector('#basic_salary').value;
    let benefits = document.querySelector('#benefits').value;

    processInput(basic_salary, pay_period, benefits, nssf_rates, nssf, nhif);
})

class PayPeriod {
    constructor(pay_period) {
        this.pay_period = pay_period;
    }
    getPayPeriod() {
        let $pay_period;
        switch (this.pay_period) {
            case "month":
                $pay_period = 1;
                break;

            case "year":
                $pay_period = 12;
                break;
        }
        return $pay_period;
    }
}

class NHIF {
    deduction;
    constructor(basic_salary, nhif) {
        this.basic_salary = basic_salary;
        this.nhif = nhif;
        this.deduction;
    }
    nhifDeduction() {
        if (this.nhif === "yes") {
            switch (true) {
                case this.basic_salary > 1000 && this.basic_salary <= 5999:
                    this.deduction = 150;
                    break;
                case this.basic_salary <= 7999:
                    this.deduction = 300;
                    break;
                case this.basic_salary <= 11999:
                    this.deduction = 400;
                    break;
                case this.basic_salary <= 14999:
                    this.deduction = 500;
                    break;
                case this.basic_salary <= 19999:
                    this.deduction = 600;
                    break;
                case this.basic_salary <= 24999:
                    this.deduction = 750;
                    break;
                case this.basic_salary <= 29999:
                    this.deduction = 850;
                    break;
                case this.basic_salary <= 34999:
                    this.deduction = 900;
                    break;
                case this.basic_salary <= 39999:
                    this.deduction = 950;
                    break;
                case this.basic_salary <= 44999:
                    this.deduction = 1000;
                    break;
                case this.basic_salary <= 49999:
                    this.deduction = 1100;
                    break;
                case this.basic_salary <= 59999:
                    this.deduction = 1200;
                    break;
                case this.basic_salary <= 69999:
                    this.deduction = 1300;
                    break;
                case this.basic_salary <= 79999:
                    this.deduction = 1400;
                    break;
                case this.basic_salary <= 89999:
                    this.deduction = 1500;
                    break;
                case this.basic_salary <= 99999:
                    this.deduction = 1600;
                    break;
                case this.basic_salary >= 100000:
                    this.deduction = 1700;
                    break;
                case "self employed":
                    this.deduction = 500;
                    break;
            }
        } else {
            this.deduction = 0;
        }
        return this.deduction;
    }
}

class NSSF {
    #oldNSSFRatesEmployeeContribution = 200;
    Deductible_NSSF_Pension_Contribution;

    constructor(basic_salary, nssf_rates, nssf) {
        this.basic_salary = basic_salary;
        this.nssf_rates = nssf_rates;
        this.nssf = nssf;

        this.#oldNSSFRatesEmployeeContribution;
        this.Deductible_NSSF_Pension_Contribution;
    }
    nssfDeduction() {
        switch (this.nssf) {
            case 'yes':
                switch (this.nssf_rates) {
                    case "new":
                        this.Deductible_NSSF_Pension_Contribution = this.#calculateNewEmployeeContribution();
                        break;
                    // if old nssf rates
                    default:
                        this.Deductible_NSSF_Pension_Contribution = this.#oldNSSFRatesEmployeeContribution;
                        break;
                }
                break;
            // If no nssf deduction
            default:
                this.Deductible_NSSF_Pension_Contribution = 0;
                break;
        }
        return this.Deductible_NSSF_Pension_Contribution;
    }

    #calculateNewEmployeeContribution() {
        return 0.06 * this.basic_salary;
    }
}

const personalRelief = (pay_period) => {
    let persRelief;
    switch (pay_period) {
        case "month":
            persRelief = 2400;
            break;
    
        case "year":
            persRelief = 28800;
            break;
    }
    return persRelief;
}

class PAYE extends PayPeriod {
    paye;
    constructor(basic_salary, benefits, pay_period, nssf_rates, nssf, nhif) {
        super(pay_period);
        this.basic_salary = basic_salary;
        this.benefits = benefits;
        this.nssf_rates = nssf_rates;
        this.nssf = nssf;
        this.nhif = nhif;

        this.NSSF = new NSSF(this.basic_salary, this.nssf_rates, this.nssf);
        this.NHIF = new NHIF(this.basic_salary, this.nhif);
        this.personal_relief = personalRelief(pay_period);

        this.paye;
    }

    taxableIncome() {
        return (parseFloat(this.basic_salary) + parseFloat(this.benefits) - this.NSSF.nssfDeduction() - this.NHIF.nhifDeduction()) * this.getPayPeriod();
    }

    _benefits() {
        return parseFloat(this.benefits) * this.getPayPeriod();
    }

    basicSalary() {
        return parseFloat(this.basic_salary) * this.getPayPeriod();
    }

    getNHIF() {
        return this.NHIF.nhifDeduction() * this.getPayPeriod();
    }

    getNSSF() {
        return this.NSSF.nssfDeduction() * this.getPayPeriod();
    }

    taxOnTaxableIncome() {
        return this.taxableIncome() * this.#incomeTaxBand();
    }

    _paye() {
        return this.taxOnTaxableIncome() - this.personal_relief * this.getPayPeriod();
    }

    #incomeTaxBand() {
        if (this.getPayPeriod() === 1 && this.taxableIncome() <= 12298 || this.getPayPeriod() === 12 && this.taxableIncome() <= 147580) {
            return 0.1;
        } else if (this.getPayPeriod() === 1 && this.taxableIncome() <= 23885 || this.getPayPeriod() === 12 && this.taxableIncome() <= 286623) {
            return 0.15;
        } else if (this.getPayPeriod() === 1 && this.taxableIncome() <= 35472 || this.getPayPeriod() === 12 && this.taxableIncome() <= 425666) {
            return 0.2;
        } else if (this.getPayPeriod() === 1 && this.taxableIncome() <= 47059 || this.getPayPeriod() === 12 && this.taxableIncome() <= 564709) {
            return 0.25;
        } else if (this.getPayPeriod() === 1 && this.taxableIncome() > 47059 || this.getPayPeriod() === 12 && this.taxableIncome() > 564709) {
            return 0.3;
        }
    }
}

const processInput = (basic_salary, pay_period, benefits, nssf_rates, nhif, nssf) => {

    let myPAYE = new PAYE(basic_salary, benefits, pay_period, nssf_rates, nssf, nhif);

    // Income Before Pension Deduction
    document.querySelector('#income_before_nssf_deduction').innerHTML = `KES ${myPAYE.basicSalary().toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
    // Deductible NSSF Pension Contribution 
    document.querySelector('#nssf').innerHTML = `KES ${myPAYE.getNSSF().toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
    // Income After Pension Deductions
    document.querySelector('#income_after_nssf_deduction').innerHTML = `KES ${(basic_salary - myPAYE.getNSSF()).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
    // Benefits in Kind
    document.querySelector('#benefits_in_kind').innerHTML = `KES ${myPAYE._benefits().toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
    // Taxable Income
    document.querySelector('#taxable_income').innerHTML = `KES ${myPAYE.taxableIncome().toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
    // Tax on Taxable Income
    document.querySelector('#tax_on_taxable_income').innerHTML = `KES ${myPAYE.taxOnTaxableIncome().toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
    // Personal Relief
    document.querySelector('#personal_relief').innerHTML = `KES ${(personalRelief(pay_period)).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
    // Tax Net Off Relief
    document.querySelector('#tax_net_off_relief').innerHTML = `KES ${myPAYE._paye().toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
    // PAYE
    document.querySelector('#paye').innerHTML = `KES ${myPAYE._paye().toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
    // Chargable Income
    document.querySelector('#chargable_income').innerHTML = `KES ${myPAYE.taxableIncome().toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
    // NHIF Contribution
    document.querySelector('#nhif').innerHTML = `KES ${myPAYE.getNHIF().toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
    // Net Pay
    document.querySelector('#net_pay').innerHTML = `KES ${(myPAYE.basicSalary() - myPAYE.getNHIF() - myPAYE.getNSSF() - myPAYE._paye()).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
}