import Card from "@/app/ui/Card";
import { Title, SubTitle, CardTitle, CardSubTitle } from "@/app/ui/Titles";
import Wrapper from "@/app/ui/Wrapper";
import SimpleBarChart from "@/app/ui/SimpleBarChart";
import SimplePieChart from "@/app/ui/SimplePieChart";
import Icon from "@/app/ui/Icon";

export default function Dashboard() {
    return (
        <>
            <Title title="Dashboard" />
            <SubTitle title="Welcome back, User!" />
            <Wrapper className="grid grid-cols-4 gap-8 mt-6">
                <Card>
                    <CardTitle title="Account Balance" className="text-lg" />
                    <p className="text-[2rem]">$2,870.00</p>
                    <p className="flex items-center"><Icon name="chevronUp" className="mr-2" />$500 from last week</p>
                </Card>
                <Card>
                    <CardTitle title="Monthly Spending" className="text-lg" />
                    <p className="text-[2rem]">$3,000.00</p>
                    <p className="flex items-center"><Icon name="chevronDown" className="mr-2" />$200 from last week</p>
                </Card>
                <Card>
                    <CardTitle title="Budget Left" className="text-lg" />
                    <p className="text-[2rem]">$530.00</p>
                    <p>32% left of your monthly budget of $1,656.25</p>
                </Card>
                <Card>
                    <CardTitle title="Upcoming Bills" className="text-lg" />
                    <p className="text-[2rem]">$270.00</p>
                    <ul>
                        <li>Electricity - $120.00 - Due in 5 days</li>
                        <li>Internet - $50.00 - Due in 10 days</li>
                    </ul>
                </Card>
            </Wrapper>
            <Wrapper className="grid grid-cols-2 gap-8 mt-6">
                <Card>
                    <CardTitle title="Income vs Expenses" className="text-[2rem] mb-6" />
                    <SimpleBarChart />
                </Card>
                <Card>
                    <CardTitle title="Spending Breakdown" className="text-[2rem]" />
                    <Wrapper className="flex items-center justify-center">
                        <SimplePieChart />
                        <ul className="grid gap-4 ml-6 text-lg">
                            <li><span className="inline-block w-4 h-4 bg-[#0088FE] mr-2"></span>Rent - 40%</li>
                            <li><span className="inline-block w-4 h-4 bg-[#00C49F] mr-2"></span>Groceries - 30%</li>
                            <li><span className="inline-block w-4 h-4 bg-[#FFBB28] mr-2"></span>Entertainment - 20%</li>
                            <li><span className="inline-block w-4 h-4 bg-[#FF8042] mr-2"></span>Other - 10%</li>
                        </ul>
                    </Wrapper>
                </Card>
                <Card>
                    <CardTitle title="Recent Transactions" className="text-[2rem]" />
                </Card>
                <Card>
                    <CardTitle title="Budget Overview" className="text-[2rem]" />
                </Card>
            </Wrapper>
        </>
    );
}