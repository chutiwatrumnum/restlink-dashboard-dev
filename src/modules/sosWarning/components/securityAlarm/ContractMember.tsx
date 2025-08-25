import CardContract from "./contractMember/CardContract";
import ContractForm from "./contractMember/ContractForm";
import ContractSuccess from "./contractMember/ContractSuccess";
const ContractMember = ({ statusContract, setStatusContract }: { statusContract: string, setStatusContract: (status: string) => void }) => {
    return (
        <>
            {statusContract === "contract" && <CardContract statusContract={statusContract} setStatusContract={setStatusContract}></CardContract>}
            {statusContract === "form" && <ContractForm statusContract={statusContract} setStatusContract={setStatusContract}></ContractForm>}
            {statusContract === "success" && <ContractSuccess></ContractSuccess>}
        </>
    )
}

export default ContractMember;