import React, { Component } from 'react';
import { Button, Popover, Icon } from 'antd';

interface IProps {
    onError?: () => void;
    onResult?: (transcript: Commands, synthesis: any, speech: any) => void;
    onSpeechEnd?: () => void;
    userName?: string;
}

interface IState {
   voiceActive: boolean;
}

let recognition: any;
let speech: any;
let synthesis: any;
let voices: any;
// let locale: { lang: string; name: string } = {
//     lang: 'en-GB',
//     name: 'Google UK English Male'
// }

export enum Commands  {
    "add new" = "add new",
    "close" = "close",
    "log out" = "log out",
    "stop" = "stop",
    "expense" = "expense",
    "budget" = "budget",
}

export const commands: Record<Commands, string> = {
    "add new": 'To Open the Add New Expense Modal',
    "close": 'To close any open Modal',
    "log out": "To Log Out of App",
    "stop": "Stop voice activation",
    "expense": "Show Monthly Expenses",
    "budget": "Show Monthly budget",
}

const content = (
    <div>
        {
            Object.keys(commands).map(key => {
                return <p key={key}>{`${key.toUpperCase()} --- ${commands[key]}`}</p>
            })
        }
    </div>
);
class VoiceCommand extends Component<IProps, IState> {
    state = {
        voiceActive: false,
    };

     componentDidMount(): void {
        const { onResult } = this.props;
        try {
            // @ts-ignore
            const SpeechRecognition: any =  window.SpeechRecognition || window.webkitSpeechRecognition;
            recognition = new SpeechRecognition();
            speech = new SpeechSynthesisUtterance();
            synthesis = window.speechSynthesis;
            voices = null;
            setTimeout(() => {
                voices = synthesis.getVoices();
                const engLinshIndex = voices.findIndex((voice: Record<string, string>) => voice.lang == 'en-US');
                speech.voice = voices[engLinshIndex];
                speech.volume = 1;
                speech.rate = 1;
                speech.pitch = 1;
            }, 10);

            recognition.continuous = true;
            recognition.onstart = () => {
                console.log('started');
            };

            recognition.onspeechend = () => {
                console.log('ended');
                recognition.stop();
            };
            recognition.onend = () => {
                const { voiceActive } = this.state;
                if (voiceActive) {
                    this.startRecording(false);
                }
            };

            recognition.onerror = (event: any) => {
                if(event.error == 'no-speech') {
                    console.log('error');
                }
            };

            recognition.onresult = (event: any) => {
                // event is a SpeechRecognitionEvent object.
                // It holds all the lines we have captured so far.
                // We only need the current one.
                const current = event.resultIndex;
                // Get a transcript of what was said.
                const transcript = event.results[current][0].transcript;
                const text = transcript.toLowerCase().trim();
                if (text == 'stop') {
                    speech.text = 'Bye User';
                    synthesis.speak(speech);
                    this.stopRecording();
                } else {
                    if (typeof onResult == 'function') {
                        onResult(text, synthesis, speech);
                    }
                }
            };
        }
        catch(e) {
            console.error(e);
        }
    }

    componentWillUnmount(): void {
        recognition = null;
    }

    startRecording = (isFirstTime = false): void => {
        const { userName } = this.props;
        if (isFirstTime) {
            speech.rate = 0.85;
            speech.text = `Welcome ${userName}, I am your Personal Voice Assistant.`;
            synthesis.speak(speech);
            speech.text = '';
            recognition.start();
        } else {
            recognition.start();
        }
        this.setState({ voiceActive: true }, () => {
            console.log('out');
        });
    };

    stopRecording = () => {
        synthesis.cancel();
        recognition.abort();
        speech.text = '';
        this.setState({ voiceActive: false });
        recognition.stop();
    };

    render() {
        const {  voiceActive } = this.state;
        return (
            <>
                <Popover content={content} title="Available Commands">
                    <span className='know-more-icon'><Icon type="question-circle" /></span>
                </Popover>
                <Button
                    type="primary"
                    onClick={() => this.startRecording(true)}
                    loading={voiceActive}
                >Activate Voice</Button>
                <Button
                    type="primary"
                    onClick={this.stopRecording}
                    disabled={!voiceActive}
                >Stop Voice</Button>
            </>
        );
    }
}

export default VoiceCommand;