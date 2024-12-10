import {
    CloudFormationClient,
    CreateStackCommand,
    DeleteStackCommand,
    DescribeStacksCommand
} from "@aws-sdk/client-cloudformation";
import {
    CreateStackCommandInput,
    DeleteStackCommandInput,
    DescribeStacksCommandInput
} from "@aws-sdk/client-cloudformation/dist-types/commands";


const client = new CloudFormationClient();
export const create_stack = async (stack: CreateStackCommandInput) => {
    const command = new CreateStackCommand(stack);
    return client.send(command)
        .then(res => res)
        .catch(e => e);
}

export const describe_stack = async (stack: DescribeStacksCommandInput)=>{
    const command = new DescribeStacksCommand(stack);
    return client.send(command)
        .then(res => res)
        .catch(e => e);
}


export const delete_stack = async (stack: DeleteStackCommandInput)=>{
    const command = new DeleteStackCommand(stack);
    return client.send(command)
        .then(res => res)
        .catch(e => e);
}
