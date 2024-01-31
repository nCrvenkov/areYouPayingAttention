import "./index.scss"
import {TextControl, Flex, FlexBlock, FlexItem, Button, Icon, PanelBody, PanelRow, ColorPicker} from "@wordpress/components" // for JSX's TextControl, etc...
import {InspectorControls, BlockControls, AlignmentToolbar} from "@wordpress/block-editor"

(function(){
    let locked = false;

    // subscribe is used to work with the latest version of the data (so the page doesn't have to be refreshed)
    wp.data.subscribe(function(){
        const results = wp.data.select("core/block-editor").getBlocks().filter(function(block){
            return block.name == "ourplugin/are-you-paying-attention" && block.attributes.correctAnswer == undefined
        })

        // to lock and unlock the Update button
        if(results.length && locked == false){
            locked = true
            wp.data.dispatch("core/editor").lockPostSaving("noanswer")
        }
        if(!results.length && locked){
            locked = false
            wp.data.dispatch("core/editor").unlockPostSaving("noanswer")
        }
    })
})()

// registering block type
wp.blocks.registerBlockType('ourplugin/are-you-paying-attention', {
    title: "Are You Paying Attention?",
    icon: "smiley",
    category: "common",
    // add Attributes
    attributes: {
        question: {type: "string"},
        answers: {type: "array", default: [""]},
        correctAnswer: {type: "number", default: undefined},
        bgColor: {type: "string", default: "#EBEBEB"},
        theAlignment: {type: "string", default: "left"}
    },
    description: "Give your audience a chance to prove their comprehension.",
    // to add preview of the block
    example: {
        attributes: {
            question: "What is my name?",
            answers: ['Meowsalot', 'Barksalot', 'Purrsloud'],
            correctAnswer: 3,
            bgColor: "#CFE8F1",
            theAlignment: "center"
        }
    },
    // what will appear on the backend
    edit: EditComponent,
    // what will appear on the frontend
    save: function(props){
        return null; // to let PHP determine this value on the fly 
    },
})

function EditComponent(props){
    // functions to set/update attributes 
    function updateQuestion(value){
        props.setAttributes({question: value})
    }

    function deleteAnswer(indexToDelete){
        const newAnswers = props.attributes.answers.filter(function(x, index){
            return index != indexToDelete
        })
        props.setAttributes({answers: newAnswers})

        if(indexToDelete == props.attributes.correctAnswer){
            props.setAttributes({correctAnswer: undefined})
        }
    }

    function markAsCorrect(index){
        props.setAttributes({correctAnswer: index})
    }

    // JSX for the backend
    // Inspector Controls for block settings
    // Block Controls for toolbar settings 
    return (
        <div className="paying-attention-edit-block" style={{backgroundColor: props.attributes.bgColor}}>
            <BlockControls>
                <AlignmentToolbar value={props.attributes.theAlignment} onChange={x => props.setAttributes({theAlignment: x})}/>
            </BlockControls>
            <InspectorControls>
                <PanelBody title="Background Color" initialOpen={true}>
                    <PanelRow>
                        <ColorPicker color={props.attributes.bgColor} onChangeComplete={x => props.setAttributes({bgColor: x.hex})}/>
                    </PanelRow>
                </PanelBody>
            </InspectorControls>
           <TextControl  label="Question:" style={{fontSize: "20px"}} value={props.attributes.question} onChange={updateQuestion} />
           <p style={{fontSize:"13px", margin: "20px 0 8px 0"}}>Answers:</p>

           {props.attributes.answers.map(function(answer, index){
            return (
                <Flex>
                    <FlexBlock>
                        <TextControl autoFocus={answer == undefined} value={answer} onChange={newValue => {
                            const newAnswers = props.attributes.answers.concat([])
                            newAnswers[index] = newValue
                            props.setAttributes({answers: newAnswers})
                        }} />
                        </FlexBlock>
                    <FlexItem>
                        <Button onClick={() => markAsCorrect(index)}>
                            <Icon className="mark-as-correct" icon={props.attributes.correctAnswer == index ? "star-filled" : "star-empty"}/>
                        </Button>
                    </FlexItem>
                    <FlexItem>
                        <Button isLink className="attention-delete" onClick={() => deleteAnswer(index)} >Delete</Button>
                    </FlexItem>
                </Flex>
            )
           })}

           <Button isPrimary onClick={() => {
            props.setAttributes({answers: props.attributes.answers.concat([undefined])})
           }} >Add Another Answer</Button>
        </div>
    )
}