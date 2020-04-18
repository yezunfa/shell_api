let ApprovalProcess = {};
ApprovalProcess.generateApprovalAction = (tablename) => {
    return `
        <If condition={record.Approval === 0}>
            <Button
                size="small"
                onClick={() => {
                    Toast.prompt("请到编辑中设置为提交审核");
                    return false;
                } }
            >
                待提交审核
            </Button>
        </If>
        <If condition={record.Approval > 1}>
            <Button
                size="small"
                onClick={() => {
                    window.location.href =  "/page/${tablename}/detail/" + record.Id +"?action=Approval";
                } }
            >
                审核
            </Button>
        </If>`
}

ApprovalProcess.getDetailApprovalForm = (tablename) => {
    return `
    {{#if($query && $query.action === "Approval")}}
    <FormSchema
            ref={"approvalform"}
            traverse={qverse($ => {
                $("*")
                .itemProps({
                    labelCol: 3
                });
                $("Approval").required(true);
                $("ApprovalComment").required(true);
                
            }) }
            defaultValue= {
                state.formData
            }
            onSubmit={methods.onApprovalSubmitHandler}
            >

            <Field 
                type="string"
                name="Approval"
                enum= {
                [{"label":"待处理","value":0},{"label":"待运营审核","value":3},{"label":"审核通过","value":1},{"label":"取消/拒绝","value":2},{"label":"异常单/人工处理","value":4}]  
                }
                title="审核状态"
            />
        
            <Field 
                type="number"  x-component="radio"
                name="ApprovalWay"
                enum= {
                [{"label":"自动审核","value":0},{"label":"人工审核","value":1}]  
                }
                title="审核方式"
            />
            <Field   type="string" name="ApprovalPerson" title="审核人" />
            <Field   type="string" name="ApprovalComment" title="审核意见" />

            <FormButtonGroup offset={6}>
                <Button onClick={ ()=> { window.location.href="/page/${tablename}/manage" } }>返回</Button>
                <Submit>提交</Submit>
            </FormButtonGroup>
    </FormSchema>
    <style>
    .schema-form-container:nth-child(3) {
          -moz-box-shadow: 2px 2px 5px #333333;
          -webkit-box-shadow: 2px 2px 5px #333333;
          box-shadow: 2px 2px 7px #333333;
          padding: 30px 0;
          border: 1px solid #777;
          border-radius: 10px;
          color: #fff;
    }
  </style>
    {{/if}}
    `;
}

ApprovalProcess.getDetailApprovalMethods = (tablename) => {
    return `
    getApprovalFormData(values) {
        // 每个表单的数据都是独立的
        let curStepFields = this.refs['approvalform'].getInstance().field._refs;
        let formData =  this.state.formData;
        console.log(curStepFields);
        for(var ref in curStepFields) {
            if(typeof values[ref] !== 'undefined') {
                formData[ref] = values[ref];
            }
        }
        return formData;
    },
    onApprovalSubmitHandler(values){
        let formData =  this.methods.getApprovalFormData(values)
        
        formData._csrf = '{{ $csrf }}';

        let url =  "/api/${tablename}/edit";

        fetch(url,{
            credentials: 'same-origin',
            method: "POST",
            data:formData
        }).then(res=>res.json()).then(res=>{
            if(res && res.success){
                Toast.success('提交成功');
                window.location.reload();
                return false;
            } else {
                if(res && res.message) {
                    if(res.message && res.message.original && res.message.original.sqlMessage) {
                        Toast.error('提交失败,请检查:' + res.message.original.sqlMessage);
                    } else {
                        Toast.error('提交失败:' + res.message);
                    }
                    
                } else {
                    Toast.error('提交失败,请稍后重试');
                }
            }
        })
    }`;

}

module.exports = ApprovalProcess;