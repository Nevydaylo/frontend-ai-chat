
console.log("backend_connector.js loaded")

let api_url = "http://metroplex:8000/api/"

export async function connect_session(primer = "the following is a coversation between assistant and user. Assistant is allways friendly and helpful.") {

    let res = await fetch(api_url + "get_new_session",
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },

            body: JSON.stringify({ "fixed_prompt": primer }),
        }
    ).catch(() => {
        console.log("cant connect session.");
        return { json: () => { return { session_id: -1 } } }
    })
    let data = await res.json()
    return data.session_id
}

export async function fetch_message(session_id, content, callback = undefined) {


    let decoder = new TextDecoder("utf-8")

    let all_text = ""

    await fetch(api_url + "user_message",
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ session_id, "user_message": content }),
        }
    ).catch(e => {
        console.error(e);
    }).then(response => {

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.body.getReader();
    })
        .catch(e => {
            console.error("error getting reader")
            console.error(e)
        })
        .then(async (reader) => {
            // eslint-disable-next-line no-self-assign
            reader = reader

            await reader.read().then(async function processResult(result) {
                if (result.done) {
                    return;
                }

                const chunk = result.value;

                let text = decoder.decode(chunk)


                try {
                    let data = JSON.parse(text)

                    if (data.text) {

                        all_text += data.text

                        if (callback) {
                            callback(data.text)
                        }

                    }
                // eslint-disable-next-line no-empty
                } catch {

                }
                return reader.read().then(processResult);
            });
        })
        .catch(e => {
            console.error("err processing result");
            console.error(e);
        })

    return all_text

}


