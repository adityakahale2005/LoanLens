function calculateEMI(principal, annualRate, tenureMonths) {
    // Monthly interest rate
    const r = annualRate / 12 / 100;

    let emi;

    // Edge case: if rate is 0, simple division
    if (r === 0) {
        emi = principal / tenureMonths;
    } else {
        // EMI formula
        const power = Math.pow(1 + r, tenureMonths);
        emi = (principal * r * power) / (power - 1);
    }

    // Round to 2 decimal places
    emi = Math.round(emi * 100) / 100;

    // Generate full amortization schedule
    const schedule = [];
    let balance = principal;
    let totalInterestPaid = 0;
    let crossoverMonth = null; // Month where principal component > interest component

    for (let month = 1; month <= tenureMonths; month++) {
        const interestComponent = Math.round(balance * r * 100) / 100;
        const principalComponent = Math.round((emi - interestComponent) * 100) / 100;

        // Find crossover point — great talking point in interviews
        if (!crossoverMonth && principalComponent > interestComponent) {
            crossoverMonth = month;
        }

        totalInterestPaid += interestComponent;

        const closingBalance = Math.round(
            Math.max(0, balance - principalComponent) * 100
        ) / 100;

        schedule.push({
            month,
            openingBalance: Math.round(balance * 100) / 100,
            emi,
            interest: interestComponent,
            principal: principalComponent,
            closingBalance
        });

        balance = closingBalance;
    }

    return {
        emi,
        totalPayment: Math.round(emi * tenureMonths * 100) / 100,
        totalInterest: Math.round(totalInterestPaid * 100) / 100,
        crossoverMonth,  // Bonus insight
        schedule
    };
}

module.exports = { calculateEMI };