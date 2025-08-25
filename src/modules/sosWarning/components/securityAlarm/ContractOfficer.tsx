
import ChooseContractPerson from "./ContractPerson/ChooseContractPerson";
import CallOfficerSuccess from "./ContractPerson/CallOfficerSuccess";
import ContractSuccess from "./contractMember/ContractSuccess";
import ContractForm from "./contractMember/ContractForm";
const ContractOfficer = ({ statusContract, setStatusContract }: { statusContract: string, setStatusContract: (status: string) => void }) => {
    return (
        <>
            {statusContract === "contract" &&  <ChooseContractPerson statusContract={statusContract} setStatusContract={setStatusContract}></ChooseContractPerson>}
            {statusContract === "callOfficer" && <CallOfficerSuccess statusContract={statusContract} setStatusContract={setStatusContract}></CallOfficerSuccess>}
            {statusContract === "form" && <ContractForm statusContract={statusContract} setStatusContract={setStatusContract}></ContractForm>}
            {statusContract === "success" && <ContractSuccess></ContractSuccess>}
        </>
    )
}

export default ContractOfficer;