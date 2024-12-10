
import RDS from "@/components/RDS";
import DynamoDBTables from "@/components/DynamoDB/DynamoDBTables";
import {Divider} from "antd";

export default function Home() {
  return <>
  <RDS/>
    <Divider />
  <DynamoDBTables/>
  </>
}
