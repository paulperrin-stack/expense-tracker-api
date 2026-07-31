type Debt = {
    id: string;
    balance: number;
    interestRate: number;
    minPayment: number;
};

export function calculatePayoff(debts: Debt[], extraPerMonth: number, strategy: "avalanche" | "snowball") {
    const sortedDebts = [...debts].map((d) => ({ ...d })).sort((a, b) => {
        if (strategy === "avalanche") {
            return b.interestRate - a.interestRate; // Sort by interest rate descending
        } else {
            return a.balance - b.balance; // Sort by balance ascending
        }
    });

    let months = 0;
    let totalInterestPaid = 0;

    while (sortedDebts.some(debt => debt.balance > 0)) {
        months++;
        let remainingExtra = extraPerMonth;

        for (const debt of sortedDebts) {
            if (debt.balance <= 0) continue;

            const monthlyRate = debt.interestRate / 100 / 12;
            const interest = debt.balance * monthlyRate;
            debt.balance += interest;
            totalInterestPaid += interest;

            let payment = Math.min(debt.minPayment, debt.balance);

            if (remainingExtra > 0 && debt === sortedDebts.find((d) => d.balance > 0)) {
                const extraForThisDebt = Math.min(remainingExtra, debt.balance - payment);
                payment += extraForThisDebt;
                remainingExtra -= extraForThisDebt;
            }
            
            debt.balance -= payment;
        }
    }

    return { months, totalInterestPaid: Math.round(totalInterestPaid * 100) / 100 }
}