var app = new Vue({
    el: '#app',
    data: function () {
        return {
            id_redaction_plan: document.getElementById('redaction_plan').innerText,
            url: document.getElementById('url').innerText,
            lex_article: {
                id_lex_article: document.getElementById('lex_article').innerText,
                id_lemma: '',
                article: '',
                finished: '',
                lex_article_elements: []
            },
            lex_article_elements: [],
            sub_models_plan: [],
            type: '',
            repeat: false,
            required: false,
            empty_autocomplete: false,
            finished_article: '',
            element: {
                id_element: '',
                type: '',
                lemma: '',
                lex_article_element: '',
                sub_elements: [],
            },
            model: {
                sub_model: []
            },
            dictionaries: [],
            dictionary: {
                name: '',
                link: ''
            },
            current_lemma: {
                id_lemma: '',
                lemma: ''
            },
            create_element_data: {
                sub_type: '',
                text: ''
            },
            lex_article_elements_interval: [],
            current_lex_article_element: {
                index: '',
                prev: '',
                data: '',
                next: ''
            },
            final_article: '',
            lemario_list: []
        }
    },
    computed: {
        finished_text: function() {
            return this.lex_article.finished ? 'Finalizado' : 'Finalizar artículo'
        },
        filterModel: function() {
            if (this.model.sub_model.length > 0 && this.lex_article_elements.length > 0) {

                let submodels = this.model.sub_model;

                let result = [];

                let stop = false;

                for (let key in submodels) {

                    let sub_model = {
                        id_sub_model: '',
                        required: '',
                        repeat: '',
                        active: false
                    };

                    sub_model.id_sub_model = submodels[key].id_sub_model;
                    sub_model.required = submodels[key].required;
                    sub_model.repeat = submodels[key].repeat;


                    if (sub_model.id_sub_model !== '') {
                        result.push(sub_model)
                    }

                    if (submodels[key].separator.id_separator !== "")  {
                        result.push(submodels[key].separator)
                    }

                    for (let item in submodels[key].elements) {
                        result.push(submodels[key].elements[item])
                    }


                }

                return result
            }
        },
    },
    mounted() {
        this.getLexArticle(this.lex_article.id_lex_article)
        this.getDictionaries()
    },
    methods: {
        nextElementAssigned: function (selected, sub_model) {
            let last_of_sub_model = _.last(sub_model.elements)

            if (selected.id_element === last_of_sub_model.id_element
                && selected.id_sub_model === last_of_sub_model.id_sub_model) {
                let next_sub_model = this.nextSubModelAssigned(sub_model)
                if (next_sub_model === undefined) {
                    return last_of_sub_model
                }else {
                    return _.first(next_sub_model.elements)
                }
            }else {
                for (let key in  this.model.sub_model) {
                    if (sub_model.id_sub_model === this.model.sub_model[key].id_sub_model) {
                        for (let j = 0; j < this.model.sub_model[key].elements.length; j++) {
                            if(this.model.sub_model[key].elements[j].id_element === selected.id_element){
                                return this.model.sub_model[key].elements[j + 1]
                            }
                        }
                    }
                }
            }
        },
        nextToWrite() {
            let last_article_element = _.last(this.lex_article_elements)
            let selected = this.getSelected()

            if (selected === '') {
                selected = {
                    id_element: last_article_element.element.id_element,
                    id_sub_model: last_article_element.sub_model.id_sub_model,
                    index: last_article_element.lex_article_element.order,
                    property: last_article_element.element.property,
                    selected: true,
                    next_to_write: false,
                    separator: {
                        id_separator: last_article_element.element_separator.id_separator,
                        representation: last_article_element.element_separator.representation,
                        selected: true
                    }
                }
            }

            let sub_models = this.model.sub_model

            for (let i = 0; i < sub_models.length; i++) {
                if (selected.id_sub_model === sub_models[i].id_sub_model) {
                    let next_to_write = this.nextElementAssigned(selected,sub_models[i])

                    selected = this.getSelected()
                    if (selected !== '' && next_to_write !== selected) {
                        next_to_write.next_to_write = true
                        return true
                    }else if (selected === '' && next_to_write !== undefined){
                        next_to_write.next_to_write = true
                        return true
                    }

                }
            }
            return false
        },
        changeNextToWrite: function () {
            let sub_models = this.model.sub_model

            let stop = false
            for (let i in sub_models){
                if (!stop && this.subModelWasAssigned(sub_models[i])){
                    for (let item in sub_models[i].elements){
                        if (!stop) {
                            let element = sub_models[i].elements[item]
                            if (element !== undefined && element.next_to_write) {
                                element.next_to_write = false
                                stop = true
                            }
                        }
                    }
                }
            }
            this.nextToWrite()
        },
        nextSubModelAssigned(sub_model) {
            let sub_models_plan = this.sub_models_plan

            for (let i = 0; i < sub_models_plan.length; i++) {
                if (sub_models_plan[i].id_sub_model === sub_model.id_sub_model) {
                    if (sub_models_plan[i + 1] !== undefined) {
                        for (let key in this.model.sub_model) {
                            if (this.model.sub_model[key].id_sub_model
                                === sub_models_plan [i + 1].id_sub_model) {
                                return this.model.sub_model[key]
                            }
                        }

                    }
                }
            }
            return undefined
        },
        modelRequired(element) {
            let sub_models = this.model.sub_model

            let stop = false

            for (let i = 0; i < sub_models.length && !stop; i++) {
                for (let j = 0; j < sub_models[i].elements.length && !stop; j++) {
                    if (sub_models[i].elements[j].id_element === element.id_element
                        && sub_models[i].id_sub_model === element.id_sub_model) {
                        if(sub_models[i].required) {
                            stop = true
                        }
                    }
                }
            }

            return stop
        },
        modelRepeated(element) {
            let sub_models = this.model.sub_model

            let stop = false

            for (let i = 0; i < sub_models.length && !stop; i++) {
                for (let j = 0; j < sub_models[i].elements.length && !stop; j++) {
                    if (sub_models[i].elements[j].id_element === element.id_element
                        && sub_models[i].id_sub_model === element.id_sub_model) {
                        if (sub_models[i].repeat) {
                            stop = true
                        }
                    }
                }
            }

            return stop
        },
        inPlan(element) {
            for (let key in this.sub_models_plan) {
                if (element.id_sub_model === this.sub_models_plan[key].id_sub_model) {
                    return true
                }
            }
            return false
        },
        isActiveSubModel: function (elem) {
            let submodels = this.model.sub_model;

            for (let key in submodels) {
                if (elem.id_sub_model === submodels[key].id_sub_model && submodels[key].active) {
                    return true
                }
            }

            return false
        },
        getSelected: function() {
            let result = ''

            let sub_models = this.model.sub_model

            for (let key in sub_models) {
                for (let item in sub_models[key].elements){
                    let element = sub_models[key].elements[item]
                    if (element.selected) {
                        result = element
                        break
                    }
                }
            }
            return result
        },
        changeSelected: function (element) {

            let submodels = this.model.sub_model;

            for (let key in submodels) {

                for (let item in submodels[key].elements) {

                    if (submodels[key].elements[item].selected) {

                        submodels[key].elements[item].selected = false;
                        submodels[key].elements[item].separator.selected = false;

                        submodels[key].active = false;

                        break
                    }
                }

                for (let item in submodels[key].elements) {
                    if ( submodels[key].elements[item].id_element === element.id_element
                        && submodels[key].id_sub_model === element.id_sub_model) {

                        submodels[key].elements[item].selected = true;
                        submodels[key].elements[item].separator.selected = true;

                        submodels[key].active = true;

                        break
                    }
                }
            }

        },
        changeModalLexArtElemActive(event) {

            let lex_article_elements = this.lex_article_elements_interval

            for (let key in lex_article_elements) {
                if (lex_article_elements[key].active) {
                    lex_article_elements[key].active = false
                }
                if (lex_article_elements[key].index === event.index) {
                    lex_article_elements[key].active = true

                    this.current_lex_article_element.index = lex_article_elements[key].index
                    this.current_lex_article_element.prev = lex_article_elements[key].prev
                    this.current_lex_article_element.next = lex_article_elements[key].next
                    this.current_lex_article_element.data = lex_article_elements[key].data
                }
            }
        },
        getActiveSubModel: function () {
            let sub_models = this.model.sub_model;
            let active = '';

            for (let key in sub_models) {
                if (sub_models[key].active){
                    active = sub_models[key];
                    break
                }
            }

            return active
        },
        async getLexArticle(id) {
            await axios.get(this.url + '/art_red_task/get-lex-article', {
                params: { id_lex_article: id }
            }).then(res => {
                const data = res.data

                this.lex_article.id_lemma = data.lex_article.id_lemma
                this.lex_article.article = data.lex_article.article
                this.lex_article.finished = data.lex_article.finished
                this.finished_article = data.lex_article.finished

                let lex_article_elements = data.lex_article_elements

                for (let key in lex_article_elements) {
                    this.lex_article.lex_article_elements.push(lex_article_elements[key])
                }

                this.loadModel(this.lex_article.id_lemma,this.id_redaction_plan,this.lex_article.id_lex_article)
            })
        },
        loadElement: function (element,lemma_id,sub_model){

            axios.get(this.url + '/art_red_task/element', {
                params: {
                    id_element: element,
                    id_lemma: lemma_id,
                    id_sub_model: sub_model,
                }
            }).then(res => {
                const data = res.data;

                if (data.type === "desc") {
                    this.type = 'desc'
                }else if (data.type === "red") {
                    this.type = 'red'
                }else if (data.type === 'lemma') {
                    this.type = 'lemma'
                }else if (data.type === 'reference_lemma') {
                    this.type = 'reference_lemma'

                    axios.get(this.url + '/art_red_task/get-lemario-lemmas', {
                        params: {
                            id_lemma: data.lemma.id_lemma,
                            id_project: data.lemma.id_project
                        }
                    }).then(res => {
                        const data = res.data

                        for (let key in data) {
                            this.lemario_list.push(data[key])
                        }

                    })
                }

                if (data.repeat) {
                    this.repeat = true;
                }else {
                    this.repeat = false
                }

                if (data.required) {
                    this.required = true;
                }else {
                    this.required = false
                }

                let selected = this.getSelected()

                let active_sub_model = this.getActiveSubModel()

                this.element = {
                    id_element: data.element.id_element,
                    id_sub_model: active_sub_model.id_sub_model,
                    type: data.element.type,
                    lemma: data.lemma.extracted_lemma,
                    sub_elements: [],
                    index: selected.index
                };

                let index = 1;
                let sub_elements_types = data.sub_elements_types;

                for (let key in sub_elements_types){
                    if (key === 'sub_element_type-'+index.toString()) {

                        let sub_element = sub_elements_types['sub_element-'+index];

                        let sub_element_type = {
                            id_sub_element: sub_element.id_sub_element,
                            id_sub_element_type: sub_elements_types[key].id_element_sub_type,
                            name: sub_elements_types[key].name
                        };

                        index++;

                        this.element.sub_elements.push(sub_element_type)
                    }
                }
            }).then(() => {
                this.changeNextToWrite()
            })
        },
        subModelWasAssigned: function (sub_model) {
            for (let key in this.sub_models_plan) {
                if (sub_model.id_sub_model === this.sub_models_plan[key].id_sub_model) {
                    return true
                }
            }

            return false
        },
        unSelectElements: function () {
            let submodels = this.model.sub_model;

            for (let key in submodels) {

                for (let item in submodels[key].elements) {

                    if (submodels[key].elements[item].selected) {

                        submodels[key].elements[item].selected = false;
                        submodels[key].elements[item].separator.selected = false;

                        submodels[key].active = false;

                        break
                    }
                }

                this.type = ''
                this.repeat = ''
            }
        },
        loadElaborationArea: function (element) {

            this.changeSelected(element);

            let active_sub_model = this.getActiveSubModel()

            if (this.subModelWasAssigned(active_sub_model)) {
                this.create_element_data.sub_type = '';
                this.create_element_data.text = ''

                let lemma = document.querySelector('.selected.lemma');
                let sub_model = this.getActiveSubModel();

                let lemma_id = '';

                if (lemma !== undefined) {
                    lemma_id = this.current_lemma.id_lemma
                }

                this.loadElement(element.id_element, lemma_id, sub_model.id_sub_model)
            }else {
                krajeeDialogError.alert("El componente seleccionado no está asignado a su plan de redacción");
                this.unSelectElements();
            }

        },
        verifyLexArtElem: function (element) {

            let lex_article_element = this.findSimpleLexArtElem(element)

            let element_interval = ''

            if (lex_article_element === '') {
                element_interval = this.getIntervalElements(element)
            }else {
                element_interval = lex_article_element
            }

            return element_interval
        },
        getIntervalElements: function(element) {
            let sub_models = this.model.sub_model
            let lex_article_elements = this.lex_article_elements

            let element_pos = {
                prev: '',
                current: '',
                next: ''
            }

            for (let key in sub_models) {
                let elements = sub_models[key].elements

                for (let i = 0; i < elements.length; i++) {
                    if (elements[i].id_element === element.id_element
                        && elements[i].id_sub_model === element.id_sub_model) {

                        if (elements[i - 1] !== undefined) {
                            element_pos.prev = elements[i - 1]
                        }

                        element_pos.current = elements[i]

                        if (elements[i + 1] !== undefined) {
                            element_pos.next = elements[i + 1]
                        }
                        break
                    }
                }
            }

            let result = {
                prev: '',
                current: '',
                next: ''
            }

            for (let i = 0; i < lex_article_elements.length; i++) {
                if (element_pos.prev !== '') {
                    if (parseFloat(lex_article_elements[i].lex_article_element.id_element) === element_pos.prev.id_element
                        && parseFloat(lex_article_elements[i].lex_article_element.id_sub_model) === element_pos.prev.id_sub_model) {

                        result.prev = lex_article_elements[i]

                    }
                }
                let next = ''
                if(element_pos.next !== '') {
                    if (lex_article_elements[i + 1] !== undefined) {
                        next = lex_article_elements[i + 1]
                        if(parseFloat(next.lex_article_element.id_element) === element_pos.next.id_element
                            && parseFloat(next.lex_article_element.id_sub_model) === element_pos.next.id_sub_model) {

                            result.next = next
                        }
                    }
                }

            }

            result.current = element_pos.current

            if (result.prev === '') {
                result.prev = undefined
            }
            if (result.next === '') {
                result.next = undefined
            }

            return result
        },
        findSimpleLexArtElem: function(element) {
            let lex_article_elements = this.lex_article_elements

            let result = ''

            if(!this.repeat) {
                for (let key in lex_article_elements) {
                    if (parseFloat(lex_article_elements[key].lex_article_element.id_element) === element.id_element
                        && parseFloat(lex_article_elements[key].lex_article_element.id_sub_model) === element.id_sub_model) {
                        result = lex_article_elements[key]
                        break
                    }
                }
            }

            return result
        },
        insertLexArtElem: function (prev, data, next) {
            let lex_article_elements = this.lex_article_elements;

            let newList = []

            let order = 1

            if (prev !== undefined && (next === '' || next === undefined)) {

                for (let i = 0; i < lex_article_elements.length; i++) {
                    let lex_article_element = lex_article_elements[i]

                    if (parseFloat(lex_article_element.lex_article_element.id_element) === parseFloat(prev.lex_article_element.id_element)
                        && parseFloat(lex_article_element.lex_article_element.id_sub_model) === parseFloat(prev.lex_article_element.id_sub_model)
                        && parseFloat(lex_article_element.lex_article_element.id_lex_article_element) ===  prev.lex_article_element.id_lex_article_element) {

                        lex_article_element.lex_article_element.order = order
                        newList.push(lex_article_element)
                        order++

                        data.lex_article_element.order = order

                        for (let key in this.model.sub_model) {
                            let sub_model = this.model.sub_model[key]
                            if (data.sub_model.id_sub_model === sub_model.id_sub_model) {
                                data.sub_model_active = sub_model
                                break
                            }
                        }

                        newList.push(data)
                        order++
                    }else {
                        lex_article_element.lex_article_element.order = order
                        newList.push(lex_article_element)
                        order++
                    }
                }

            }
            else if ((prev === '' || prev === undefined) && next !== undefined) {

                for (let i = 0; i < lex_article_elements.length; i++) {
                    let lex_article_element = lex_article_elements[i]

                    if (parseFloat(lex_article_element.lex_article_element.id_element) === parseFloat(next.lex_article_element.id_element)
                        && parseFloat(lex_article_element.lex_article_element.id_sub_model)  === parseFloat(next.lex_article_element.id_sub_model)
                        && parseFloat(lex_article_element.lex_article_element.id_lex_article_element) ===  next.lex_article_element.id_lex_article_element) {
                        data.lex_article_element.order = order

                        for (let key in this.model.sub_model) {
                            let sub_model = this.model.sub_model[key]
                            if (data.sub_model.id_sub_model === sub_model.id_sub_model) {
                                data.sub_model_active = sub_model
                                break
                            }
                        }

                        newList.push(data)
                        order++

                        lex_article_element.lex_article_element.order = order
                        newList.push(lex_article_element)
                        order++
                    }else {
                        lex_article_element.lex_article_element.order = order
                        newList.push(lex_article_element)
                        order++
                    }
                }

            }
            else if (prev !== undefined && next !== undefined) {

                let previous = ''
                let next_elem = ''

                for (let i = 0; i < lex_article_elements.length; i++) {
                    previous = lex_article_elements[i]
                    next_elem = lex_article_elements[i + 1]

                    if (next_elem !== undefined) {
                        if (parseFloat(previous.lex_article_element.id_element) === parseFloat(prev.lex_article_element.id_element)
                            && parseFloat(previous.lex_article_element.id_sub_model)  === parseFloat(prev.lex_article_element.id_sub_model)
                            && parseFloat(previous.lex_article_element.id_lex_article_element)  ===  parseFloat(prev.lex_article_element.id_lex_article_element)
                            && parseFloat(next_elem.lex_article_element.id_element)  === parseFloat(next.lex_article_element.id_element)
                            && parseFloat(next_elem.lex_article_element.id_sub_model)  === parseFloat(next.lex_article_element.id_sub_model)
                            && parseFloat(next_elem.lex_article_element.id_lex_article_element)  ===  parseFloat(next.lex_article_element.id_lex_article_element) ) {

                            lex_article_elements[i].lex_article_element.order = order
                            newList.push(lex_article_elements[i])
                            order++

                            data.lex_article_element.order = order
                            for (let key in this.model.sub_model) {
                                let sub_model = this.model.sub_model[key]
                                if (data.sub_model.id_sub_model === sub_model.id_sub_model) {
                                    data.sub_model_active = sub_model
                                    break
                                }
                            }
                            newList.push(data)
                            order++

                            lex_article_elements[i + 1].lex_article_element.order = order
                            newList.push(lex_article_elements[i + 1])
                            order++
                        }else {
                            lex_article_elements[i].lex_article_element.order = order
                            newList.push(lex_article_elements[i])
                            order++
                        }
                    }

                }
            }

            this.lex_article_elements = newList

            let result = []

            for (let key in this.lex_article_elements) {
                result.push(this.lex_article_elements[key].lex_article_element.id_lex_article_element);
            }

            result = _.toPlainObject(result)
            result = _(result).toJSON()

            axios.get(this.url + '/art_red_task/change-lex-art-elem', {
                params: {
                    lex_article_elements: result
                }
            }).then(res => console.log(res.data))

        },
        verifyIfWasRedacted: function (id_element,id_sub_model) {
            let lex_article_elements = this.lex_article_elements

            for (let key in lex_article_elements){
                if (lex_article_elements[key].element.id_element === parseFloat(id_element)
                    && lex_article_elements[key].sub_model.id_sub_model === parseFloat(id_sub_model)){
                    return true
                }
            }
            return false
        },
        elemPosInSubModel: function (id_element, id_sub_model) {
            let elem_pos = {
                prev: [],
                current: '',
                next: ''
            }

            let sub_models = this.model.sub_model

            let stop = false

            for (let i = 0; i < sub_models.length && !stop; i++) {

                if (sub_models[i + 1] !== undefined && sub_models[i + 1].id_sub_model === id_sub_model
                    && this.subModelWasAssigned(sub_models[i])) {
                    let current_sub_model = sub_models[i]

                    let last_element = _.last(current_sub_model.elements)

                    elem_pos.prev.push(last_element)
                }

                if (sub_models[i].id_sub_model === id_sub_model) {
                    let current_sub_model = sub_models[i]
                    for (let j = 0; j < current_sub_model.elements.length;j++) {
                        let element = current_sub_model.elements[j]

                        if (element.id_element === id_element && j === 0){
                            elem_pos.current = element
                            elem_pos.prev.push(current_sub_model.elements[current_sub_model.elements.length - 1])
                        }else if (element.id_element === id_element && j > 0) {
                            elem_pos.current = element
                            elem_pos.prev.push(current_sub_model.elements[j - 1])
                            if ((j + 1) < current_sub_model.elements.length) {
                                elem_pos.next = current_sub_model.elements[j + 1]
                            }
                        }
                    }
                }
            }

            return elem_pos
        },
        getLastLexArticleRedacted (id_element, id_sub_model) {
            let lex_article_elements = this.lex_article_elements;

            for (let i = lex_article_elements.length - 1; i > 0; i--) {
                if (parseFloat(lex_article_elements[i].lex_article_element.id_element) === parseFloat(id_element)
                    && parseFloat(lex_article_elements[i].lex_article_element.id_sub_model) === parseFloat(id_sub_model))  {
                    return lex_article_elements[i]
                }
            }

            return undefined
        },
        getMultipleIntervalElements: function (current,data) {
            let sub_models = this.model.sub_model
            let lex_article_elements = this.lex_article_elements

            let element_position = {
                prev: '',
                current: '',
                next: ''
            }

            let result = []

            if (this.verifyIfWasRedacted(data.lex_article_element.id_element,data.lex_article_element.id_sub_model)) {

                let elem_pos = this.elemPosInSubModel(data.element.id_element, data.sub_model.id_sub_model)

                let index = 1

                for (let i = 0; i < lex_article_elements.length; i++) {

                    let interval = {
                        index: '',
                        prev: '',
                        next: '',
                        data: '',
                        active: false
                    }

                    let prev = ''
                    let next = ''

                    let prev_element = ''

                    if (elem_pos.prev.length > 0) {
                        prev_element = _.first(elem_pos.prev)

                        prev = lex_article_elements[i]

                      let last_redacted = this.getLastLexArticleRedacted(prev_element.id_element,prev_element.id_sub_model)

                        if (last_redacted !== undefined) {

                            if (lex_article_elements[i + 1] !== undefined) {
                                next = lex_article_elements[i + 1]
                                if (parseFloat(next.element.id_element) !== data.element.id_element) {
                                    interval.prev = last_redacted
                                    elem_pos.prev.shift()
                                }
                            }
                        }
                        if (parseFloat(prev.lex_article_element.id_element)  === prev_element.id_element
                            && parseFloat(lex_article_elements[i].lex_article_element.id_sub_model) === prev_element.id_sub_model
                            && (lex_article_elements[i + 1] === undefined
                                || parseFloat(lex_article_elements[i + 1].lex_article_element.id_sub_model) !== prev_element.id_sub_model)
                            && interval.prev === '') {
                            interval.prev = prev
                            elem_pos.prev.shift()
                        }
                    }
                    if (elem_pos.next !== '') {
                        if (lex_article_elements[i + 1] !== undefined) {
                            next = lex_article_elements[i + 1]
                            prev = lex_article_elements[i]

                            if (parseFloat(next.lex_article_element.id_element) === elem_pos.next.id_element
                                && parseFloat(next.lex_article_element.id_sub_model) === elem_pos.next.id_sub_model
                                && parseFloat(prev.element.id_element) !== data.element.id_element) {
                                interval.next = next
                            }

                        } else if (lex_article_elements[i + 1] === undefined) {
                            prev = lex_article_elements[i]

                            if (parseFloat(prev.lex_article_element.id_element) === elem_pos.next.id_element
                                && parseFloat(prev.lex_article_element.id_sub_model) === elem_pos.next.id_sub_model
                                && parseFloat(prev.element.id_element) !== data.element.id_element) {
                                interval.prev = prev
                            }
                        }
                    }
                    if ((interval.prev !== '' && interval.next === '')
                        || (interval.prev === '' && interval.next !== '')
                        || (interval.prev !== '' && interval.next !== '') ) {
                        interval.index = index
                        interval.data = data
                        result.push(interval)
                        index++
                    }

                    if (result.length > 0 ) {
                        result[0].active = true

                        this.current_lex_article_element.index = result[0].index
                        this.current_lex_article_element.prev = result[0].prev
                        this.current_lex_article_element.next = result[0].next
                        this.current_lex_article_element.data = result[0].data
                    }
                }
            }else {
                let stop = false
                for (let key in sub_models) {
                    if (!stop) {
                        let elements = sub_models[key].elements

                        for (let i = 0; i < elements.length && !stop; i++) {
                            if (elements[i].id_element === current.id_element
                                && elements[i].id_sub_model === current.id_sub_model) {

                                if (elements[i - 1] !== undefined) {
                                    element_position.prev = elements[i - 1]
                                }
                                element_position.current = elements[i]

                                if (elements[i + 1] !== undefined)   {
                                    element_position.next = elements[i + 1]
                                }

                                stop = true
                            }
                        }
                    }
                }

                let index = 1

                for (let i = 0; i < lex_article_elements.length; i++) {

                    let val = lex_article_elements[i]

                    let interval = {
                        index: '',
                        prev: '',
                        next: '',
                        data: '',
                        active: false
                    }

                    let prev = ''
                    let next = ''

                    if (element_position.prev !== '') {
                        prev = lex_article_elements[i]
                        if (parseFloat(prev.lex_article_element.id_element)  === element_position.prev.id_element
                            && parseFloat(prev.lex_article_element.id_sub_model) === element_position.prev.id_sub_model) {

                            if (lex_article_elements[i + 1] !== undefined) {
                                next = lex_article_elements[i + 1]
                                if (parseFloat(next.element.id_element)  !== data.element.id_element) {
                                    interval.prev = prev
                                }
                            }
                        }
                        if (parseFloat(prev.lex_article_element.id_element)  === element_position.prev.id_element
                            && parseFloat(lex_article_elements[i].lex_article_element.id_sub_model) === element_position.prev.id_sub_model
                            && lex_article_elements[i + 1] === undefined ) {
                            interval.prev = prev
                        }
                    }

                    if (element_position.next !== '') {
                        if (lex_article_elements[i + 1] !== undefined ) {
                            next = lex_article_elements[i + 1]
                            prev = lex_article_elements[i]

                            if (parseFloat(next.lex_article_element.id_element)  === element_position.next.id_element
                                && parseFloat(next.lex_article_element.id_sub_model)  === element_position.next.id_sub_model
                                && parseFloat(prev.element.id_element) !== data.element.id_element) {
                                interval.next = next
                            }

                        }else if (lex_article_elements[i + 1] === undefined){
                            prev = lex_article_elements[i]

                            if (parseFloat(prev.lex_article_element.id_element)  === element_position.next.id_element
                                && parseFloat(prev.lex_article_element.id_sub_model)  === element_position.next.id_sub_model
                                && parseFloat(prev.element.id_element) !== data.element.id_element) {
                                interval.prev = prev
                            }
                        }
                    }


                    if ((interval.prev !== '' && interval.next === '')
                        || (interval.prev === '' && interval.next !== '')
                        || (interval.prev !== '' && interval.next !== '') ) {
                        interval.index = index
                        interval.data = data
                        result.push(interval)
                        index++
                    }
                }

                if (result.length > 0 ) {
                    result[0].active = true

                    this.current_lex_article_element.index = result[0].index
                    this.current_lex_article_element.prev = result[0].prev
                    this.current_lex_article_element.next = result[0].next
                    this.current_lex_article_element.data = result[0].data
                }
            }

            return result

        },
        getSubModelInterval: function (current) {

            let sub_models = []

            for (let key in this.model.sub_model){
                sub_models.push(this.model.sub_model[key])
            }

            let result = ''

            while (sub_models.length > 0 && result === '') {
                let current_sub_model = sub_models.pop()

                if (current_sub_model.id_sub_model === current.id_sub_model) {

                    if (_.isEmpty(sub_models)) {
                        return current
                    }

                    let elements = []

                    for (let element in current_sub_model.elements) {
                        elements.push(current_sub_model.elements[element])
                    }

                    while(elements.length > 0 && result === '') {

                        let elem = elements.pop()

                        if (this.verifyIfWasRedacted(elem.id_element, elem.id_sub_model) && result === '') {
                            let lex_article_elements = this.lex_article_elements
                            for (let key in lex_article_elements){
                                if (parseFloat(lex_article_elements[key].lex_article_element.id_element) === elem.id_element
                                    && parseFloat(lex_article_elements[key].lex_article_element.id_sub_model) === elem.id_sub_model){
                                    result = lex_article_elements[key]
                                }
                            }
                        }
                    }

                    let prev_sub_model = sub_models.pop()

                    if (prev_sub_model !== undefined && this.subModelWasAssigned(prev_sub_model) && result === '') {

                        let elements = []

                        for (let element in prev_sub_model.elements) {
                            elements.push(prev_sub_model.elements[element])
                        }

                        while (elements.length > 0 && result === '') {

                            let elem = elements.pop()

                            if (this.verifyIfWasRedacted(elem.id_element, elem.id_sub_model) && result === '') {
                                let lex_article_elements = this.lex_article_elements
                                for (let key in lex_article_elements){
                                    if (parseFloat(lex_article_elements[key].lex_article_element.id_element) === elem.id_element
                                        && parseFloat(lex_article_elements[key].lex_article_element.id_sub_model) === elem.id_sub_model){
                                        result = lex_article_elements[key]
                                    }
                                }
                            }
                        }

                        if (result === '') {
                            while (sub_models.length > 0 && result === '') {
                                let prev_sub_model = sub_models.pop()

                                if (prev_sub_model !== undefined && this.subModelWasAssigned(prev_sub_model) && result === '') {

                                    let elements = []

                                    for (let element in prev_sub_model.elements) {
                                        elements.push(prev_sub_model.elements[element])
                                    }

                                    while (elements.length > 0 && result === ''){

                                        let elem = elements.pop()

                                        if (this.verifyIfWasRedacted(elem.id_element, elem.id_sub_model) && result === '') {
                                            let lex_article_elements = this.lex_article_elements
                                            for (let key in lex_article_elements){
                                                if (parseFloat(lex_article_elements[key].lex_article_element.id_element) === elem.id_element
                                                    && parseFloat(lex_article_elements[key].lex_article_element.id_sub_model) === elem.id_sub_model){
                                                    result = lex_article_elements[key]

                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }else {
                        while (sub_models.length > 0 && result === '') {
                            let prev_sub_model = sub_models.pop()

                            if (prev_sub_model !== undefined && this.subModelWasAssigned(prev_sub_model) && result === '') {

                                let elements = []

                                for (let element in prev_sub_model.elements) {
                                    elements.push(prev_sub_model.elements[element])
                                }

                                while (elements.length > 0 && result === '') {
                                    let elem = elements.pop()
                                    if (this.verifyIfWasRedacted(elem.id_element, elem.id_sub_model)) {
                                        let lex_article_elements = this.lex_article_elements
                                        for (let key in lex_article_elements){
                                            if (parseFloat(lex_article_elements[key].lex_article_element.id_element) === elem.id_element
                                                && parseFloat(lex_article_elements[key].lex_article_element.id_sub_model) === elem.id_sub_model){
                                                result = lex_article_elements[key]

                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            return result
        },
        onSubmit: function (element) {

            if (element.lex_article_element === undefined) {

                let interval = this.verifyLexArtElem(element)

                let error = false

                if (this.verifyIfWasRedacted(element.id_element,element.id_sub_model) && !this.repeat){
                    krajeeDialogError.alert("El elemento fue redactado ya en el artículo resultante.");
                    error = true
                }

                if (this.create_element_data.text === "" && this.type === 'red') {
                    krajeeDialogError.alert("Tiene que redactar el texto elemento.");
                    error = true
                }

                if(!error) {
                    if ((interval.prev !== undefined || interval.next !== undefined ) && (interval.prev !== '' || interval.next !== '')) {

                        let lemma = document.querySelector('input#lemma') !== null ?  document.querySelector('input#lemma').value : '';

                        let sub_model_separator_id = '';

                        let element = this.getSelected()
                        let separator_id = ''
                        if (element.separator.id_separator !== undefined) {
                            separator_id = element.separator.id_separator
                        }

                        let sub_model_id = interval.current.id_sub_model

                        let sub_model_separator = document.querySelector('li.sub_model_element.selected');
                        let sub_model_separator_sibling = sub_model_separator.previousElementSibling

                        if (sub_model_separator_sibling !== undefined && sub_model_separator_sibling !== null){
                            if (sub_model_separator_sibling.className === 'sub_model_separator') {
                                sub_model_separator_id = parseFloat(sub_model_separator_sibling.id);
                            }
                        }

                        axios.get(this.url + '/art_red_task/create-element', {
                            params: {
                                id_lex_article: this.lex_article.id_lex_article,
                                id_element:  interval.current.id_element,
                                lemma: lemma,
                                separator_id: separator_id,
                                sub_type: this.create_element_data.sub_type,
                                text: this.create_element_data.text,
                                sub_model_separator_id: sub_model_separator_id,
                                order: interval.current.index,
                                id_sub_model: sub_model_id
                            }
                        }).then(res => {
                            const data = res.data;

                            if (!this.repeat) {
                                this.insertLexArtElem(interval.prev,data,interval.next)
                            }else {
                                this.lex_article_elements_interval = this.getMultipleIntervalElements(interval.current,data)
                                $("#interval-list").modal('show')
                            }

                        })
                    }
                    else if (interval.current !== undefined) {
                        let last_sub_model_element = this.getSubModelInterval(interval.current)

                        if (last_sub_model_element.lex_article_element !== undefined) {
                            let lemma = document.querySelector('input#lemma') !== null ?  document.querySelector('input#lemma').value : '';

                            let sub_model_separator_id = '';

                            let element = this.getSelected()
                            let separator_id = ''
                            if (element.separator.id_separator !== undefined) {
                                separator_id = element.separator.id_separator
                            }

                            let sub_model_id = interval.current.id_sub_model

                            let sub_model_separator = document.querySelector('li.sub_model_element.selected');
                            let sub_model_separator_sibling = sub_model_separator.previousElementSibling;

                            if (sub_model_separator_sibling !== undefined && sub_model_separator_sibling !== null){
                                if (sub_model_separator_sibling.className === 'sub_model_separator') {
                                    sub_model_separator_id = parseFloat(sub_model_separator_sibling.id);
                                }
                            }

                            axios.get(this.url + '/art_red_task/create-element', {
                                params: {
                                    id_lex_article: this.lex_article.id_lex_article,
                                    id_element:  interval.current.id_element,
                                    lemma: lemma,
                                    separator_id: separator_id,
                                    sub_type: this.create_element_data.sub_type,
                                    text: this.create_element_data.text,
                                    sub_model_separator_id: sub_model_separator_id,
                                    order: interval.current.index,
                                    id_sub_model: sub_model_id
                                }
                            }).then(res => {
                                const data = res.data;

                                this.insertLexArtElem(last_sub_model_element, data ,'')

                            })
                        }
                        else if (last_sub_model_element.id_element !== undefined) {
                            let lemma = document.querySelector('input#lemma') !== null ?  document.querySelector('input#lemma').value : '';

                            let sub_model_separator_id = '';
                            let element = this.getSelected()
                            let separator_id = ''
                            if (element.separator.id_separator !== undefined) {
                                separator_id = element.separator.id_separator
                            }


                            let sub_model = this.getActiveSubModel();
                            let sub_model_id = sub_model.id_sub_model

                            let sub_model_separator = document.querySelector('li.sub_model_element.selected');
                            let sub_model_separator_sibling = sub_model_separator.previousElementSibling;

                            if (sub_model_separator_sibling !== undefined && sub_model_separator_sibling !== null){
                                if (sub_model_separator_sibling.className === 'sub_model_separator') {
                                    sub_model_separator_id = parseFloat(sub_model_separator_sibling.id);
                                }
                            }

                            let last_order = ''

                            if (this.lex_article_elements.length > 0) {
                                let last = _.last(this.lex_article_elements);
                                last_order = parseFloat(last.lex_article_element.order + 1)
                            }else {
                                last_order = 1
                            }

                            console.log(last_order)

                            axios.get(this.url + '/art_red_task/create-element', {
                                params: {
                                    id_lex_article: this.lex_article.id_lex_article,
                                    id_element:  this.element.id_element,
                                    lemma: lemma,
                                    separator_id: separator_id,
                                    sub_type: this.create_element_data.sub_type,
                                    text: this.create_element_data.text,
                                    sub_model_separator_id: sub_model_separator_id,
                                    order: last_order,
                                    id_sub_model: sub_model_id
                                }
                            }).then(res => {
                                const data = res.data;

                                data.type = this.type;
                                data.required = this.required
                                data.repeat = this.repeat

                                data.selected = this.getSelected()

                                for (let key in this.model.sub_model) {
                                    if (this.model.sub_model[key].active) {
                                        data.sub_model_active = this.model.sub_model[key]
                                    }
                                }

                                this.lex_article_elements.push(data);

                                this.create_element_data.sub_type = '';
                                this.create_element_data.text = ''

                                this.empty_autocomplete = true

                            })

                        }
                    }
                }
            }else {
                console.log(element)
                let error = false

                if (this.create_element_data.text === "" && this.type === 'red') {
                    krajeeDialogError.alert("Tiene que redactar el texto elemento.");
                    error = true
                }

                let lemma = document.querySelector('input#lemma') !== null ?  document.querySelector('input#lemma').value : '';

                axios.get(this.url + '/art_red_task/update-lex-art-elem', {
                    params: {
                        id_lex_article_element: element.lex_article_element.id_lex_article_element,
                        sub_type: this.create_element_data.sub_type,
                        text: this.create_element_data.text,
                        lemma: lemma,
                        id_element: element.id_element
                    }
                }).then(res => {
                    const data = res.data;

                    for (let key in this.lex_article_elements) {
                        if (this.lex_article_elements[key].lex_article_element.id_lex_article_element
                            === data.lex_article_element.id_lex_article_element){

                            this.lex_article_elements[key].sub_element = data.sub_element
                            this.lex_article_elements[key].element = data.element
                            this.lex_article_elements[key].lex_article_element = data.lex_article_element
                            this.lex_article_elements[key].sub_element_type = data.sub_element_type

                            break
                        }
                    }
                })
            }

        },
        getDictionaries: function() {
            axios.get(this.url + '/art_red_task/dictionaries')
                .then(res => {
                    const data = res.data;
                    for (let key in data) {
                        let dictionary = { name: '', link: ''};

                        dictionary.name = data[key].name;
                        dictionary.link = data[key].link;

                        this.dictionaries.push(dictionary)
                    }
                })
        },
        loadDictionary: function (name,link) {
            this.dictionary.name = name;
            this.dictionary.link = link;

            $("#dictionary").modal('show');
        },
        async loadModel(id_lemma,id_redaction_plan,id_lex_article) {

            const res = await axios.get(this.url + '/art_red_task/area', {
                params: {
                    id_lemma: id_lemma,
                    id_redaction_plan: id_redaction_plan,
                    id_lex_article: id_lex_article
                }
            })

            const data = res.data;

            this.current_lemma.id_lemma = data.lemma.id_lemma
            this.current_lemma.lemma = data.lemma.extracted_lemma

            const sub_models_plan = data.sub_models_plan

            for (let key in sub_models_plan) {
                this.sub_models_plan.push(sub_models_plan[key])
            }

            const model = data.model;

            let i = 1;

            let index = 1;

            for (let key in model) {
                let submodel_key = i.toString();

                let submodel = {
                    id_sub_model: '',
                    repeat: '',
                    required: '',
                    active: false,
                    elements: [],
                    separator: {
                        id_separator: '',
                        scope: '',
                        representation: ''
                    },
                };

                if (key === 'submodel-'+submodel_key){
                    let sub_model = model[key];

                    let elem_index = 1;
                    let sep_index = 1;

                    for (let item in sub_model){
                        let elem_index_key = elem_index.toString();

                        if (item === 'sub_model') {
                            submodel.id_sub_model = sub_model[item].id_sub_model;
                            submodel.repeat = sub_model[item].repeat;
                            submodel.required = sub_model[item].required;

                            if (model['sub_model_separator-'+submodel.id_sub_model] !== undefined) {
                                submodel.separator.id_separator = model['sub_model_separator-'+submodel.id_sub_model].id_separator;
                                submodel.separator.scope = model['sub_model_separator-'+submodel.id_sub_model].scope;
                                submodel.separator.representation = model['sub_model_separator-'+submodel.id_sub_model].representation;

                            }
                        }

                        if (item === 'element-'+elem_index_key) {

                            let element =  {
                                index: '',
                                id_sub_model: '',
                                id_element: '',
                                type: '',
                                selected: false,
                                next_to_write: false,
                                property: '',
                                separator: {
                                    id_separator: '',
                                    selected: false,
                                    representation: ''
                                },
                            };

                            element.index = index;
                            element.id_element = sub_model[item].id_element;
                            element.id_sub_model = submodel.id_sub_model;
                            element.property = sub_model[item].property;
                            element.type = sub_model['element_type-'+elem_index_key];

                            if (sub_model['element_separator-'+ element.id_element] !== undefined) {
                                element.separator.id_separator = sub_model['element_separator-'+ element.id_element].id_separator;
                                element.separator.representation = sub_model['element_separator-'+ element.id_element].representation;
                            }

                            submodel.elements.push(element);

                            index++;

                            elem_index++;
                            sep_index++
                        }
                    }
                    i++
                }

                if (submodel.id_sub_model !== '') {
                    this.model.sub_model.push(submodel)
                }

            }

            this.fillLexArticleElements()

        },
        async fillLexArticleElements() {
            let lex_article_elements = this.lex_article.lex_article_elements

            let result = []

            for (let i = 0; i < lex_article_elements.length; i++) {
                result.push(lex_article_elements[i].id_lex_article_element)
            }

            result = _.toPlainObject(result)
            result = _(result).toJSON()

            const res = await axios.get(this.url + '/art_red_task/get-lex-article-element', {
                params: {
                    lex_article_elements_id: result
                }
            })
            const data = res.data

            for (let item in data) {
                for (let key in this.model.sub_model) {
                    let sub_model = this.model.sub_model[key]
                    if (data[item].sub_model.id_sub_model === sub_model.id_sub_model) {
                        data[item].sub_model_active = sub_model
                    }
                }
            }

            for (let key in data) {
                this.lex_article_elements.push(data[key]);
            }

            this.changeNextToWrite()

        },
        deleteLexArtElem: function (event) {
            this.lex_article_elements = event[1];

            let order = 1;

            let result = [];

            if (this.lex_article_elements.length === 0) {
                result.push(event[0].lex_article_element.id_lex_article_element)

                result = _.toPlainObject(result)
                result = _(result).toJSON()

                axios.get(this.url + '/art_red_task/delete-lex-art-elem', {
                    params: {
                        lex_article_element: result
                    }
                })
            }

            if (this.lex_article_elements.length > 0) {

                for (let key in this.lex_article_elements) {
                    this.lex_article_elements[key].lex_article_element.order = order;

                    result.push(this.lex_article_elements[key].lex_article_element.id_lex_article_element);
                    order++
                }

                result = _.toPlainObject(result)
                result = _(result).toJSON()


                axios.get(this.url + '/art_red_task/change-lex-art-elem', {
                    params: {
                        lex_article_elements: result
                    }
                }).then(() => {

                    result = []
                    result.push(event[0].lex_article_element.id_lex_article_element)

                    result = _.toPlainObject(result)
                    result = _(result).toJSON()

                    axios.get(this.url + '/art_red_task/delete-lex-art-elem', {
                        params: {
                            lex_article_element: result
                        }
                    })
                })
            }
        },
        loadElementUpdate: function (id_element, lemma_id, id_sub_model,lex_article_element) {

            axios.get(this.url + '/art_red_task/element', {
                params: {
                    id_element: id_element,
                    id_lemma: lemma_id,
                    id_sub_model: id_sub_model,
                }
            }).then(res => {
                const data = res.data;

                if (data.type === "desc") {
                    this.type = 'desc'
                } else if (data.type === "red") {
                    this.type = 'red'
                } else if (data.type === 'lemma') {
                    this.type = 'lemma'
                } else if (data.type === 'reference_lemma') {
                    this.type = 'reference_lemma'

                    axios.get(this.url + '/art_red_task/get-lemario-lemmas', {
                        params: {
                            id_lemma: data.lemma.id_lemma,
                            id_project: data.lemma.id_project
                        }
                    }).then(res => {
                        const data = res.data

                        for (let key in data) {
                            this.lemario_list.push(data[key])
                        }

                    })
                }

                if (data.repeat) {
                    this.repeat = true;
                } else {
                    this.repeat = false
                }

                if (data.required) {
                    this.required = true;
                } else {
                    this.required = false
                }

                let selected = this.getSelected()

                let active_sub_model = this.getActiveSubModel()

                this.element = {
                    id_element: data.element.id_element,
                    id_sub_model: active_sub_model.id_sub_model,
                    type: data.element.type,
                    lemma: data.lemma.extracted_lemma,
                    lex_article_element: lex_article_element,
                    sub_elements: [],
                    index: selected.index
                };

                let index = 1;
                let sub_elements_types = data.sub_elements_types;

                for (let key in sub_elements_types) {
                    if (key === 'sub_element_type-' + index.toString()) {

                        let sub_element = sub_elements_types['sub_element-' + index];

                        let sub_element_type = {
                            id_sub_element: sub_element.id_sub_element,
                            id_sub_element_type: sub_elements_types[key].id_element_sub_type,
                            name: sub_elements_types[key].name
                        };

                        index++;

                        this.element.sub_elements.push(sub_element_type)
                    }
                }
            })
        },
        updateLexArtElem: function (event) {

            let id_separator = event.element_separator === null ? null : event.element_separator.id_separator
            let representation = event.element_separator === null ? null : event.element_separator.representation

            let selected = {
                id_element: event.element.id_element,
                id_sub_model: event.sub_model.id_sub_model,
                index: event.lex_article_element.order,
                property: event.element.property,
                selected: true,
                next_to_write: false,
                separator: {
                    id_separator: id_separator,
                    representation: representation,
                    selected: true
                }
            }

            this.changeSelected(selected)

            if (this.subModelWasAssigned(event.sub_model))  {

                let lemma = document.querySelector('.selected.lemma');

                let lemma_id = '';

                if (lemma !== undefined){
                    lemma_id = this.current_lemma.id_lemma
                }

                this.loadElementUpdate(event.element.id_element,lemma_id,event.lex_article_element.id_sub_model, event.lex_article_element)

                if (event.sub_element !== undefined) {
                    this.create_element_data.sub_type = event.sub_element.id_sub_element
                }else  {
                    this.create_element_data.sub_type = ''
                }

                this.create_element_data.text = event.lex_article_element.element
            } else {
                this.unSelectElements();
                krajeeDialogError.alert("El elemento seleccionado no está asignado a su plan de redacción");
            }
        },
        verifyLexArticle: function() {
            let ok = true;

            let sub_models = this.model.sub_model

            for(let key in sub_models) {
                let elements = sub_models[key].elements
                for (let item in elements) {
                    if(ok) {
                        if (!this.verifyIfWasRedacted(elements[item].id_element, elements[item].id_sub_model) && sub_models[key].required) {
                            krajeeDialogError.alert("Existen elementos que pertenecen a componentes que son requeridos, por lo que tienen que insertarse.");
                            ok = false
                        }
                    }
                }
            }

            return ok
        },
        saveLexArticle: function () {

            if (this.lex_article.finished) {
                if (this.verifyLexArticle()) {

                    let article = document.createElement('p')
                    article.classList.add('lex_article')

                    let lexicographical_element = document.querySelectorAll('#lexicographical_element li.lex_element')

                    let elements = []

                    for(let i = 0; i < lexicographical_element.length; i++) {
                        let children = lexicographical_element[i].children
                        for (let j = 0; j < children.length; j++) {
                            if (!children[j].classList.contains('elem-remover') || !children[j].classList.length === 0) {
                                elements.push(children[j])
                            }
                        }
                    }

                    for (let item in elements) {
                        if (elements[item].childNodes.length > 1)  {
                            elements[item].childNodes[0].data = _.trim(_.trim(elements[item].childNodes[0].data) + _.trim(elements[item].childNodes[1].innerText))
                            elements[item].removeChild(elements[item].childNodes[1])
                        }

                        elements[item].style.marginRight = '5px'
                    }

                    for (let key in elements) {
                        article.appendChild(elements[key])
                    }

                    let final_article = $("#final_article").get(0)
                    final_article.value = article.outerHTML

                    let finish_article = $("input[name='finished']").get(0)
                    finish_article.value = this.lex_article.finished

                    if (final_article !== ''){
                        $('#save-article').submit()
                    }
                }
            }
            else {
                let article = document.createElement('p')
                article.classList.add('lex_article')

                let lexicographical_element = document.querySelectorAll('#lexicographical_element li.lex_element')

                let elements = []

                for(let i = 0; i < lexicographical_element.length; i++) {
                    let children = lexicographical_element[i].children
                    for (let j = 0; j < children.length; j++) {
                        if (!children[j].classList.contains('elem-remover') || !children[j].classList.length === 0) {
                            elements.push(children[j])
                        }
                    }
                }

                for (let item in elements) {
                    if (elements[item].childNodes.length > 1)  {
                        elements[item].childNodes[0].data = _.trim(_.trim(elements[item].childNodes[0].data) + _.trim(elements[item].childNodes[1].innerText))
                        elements[item].removeChild(elements[item].childNodes[1])
                    }

                    elements[item].style.marginRight = '5px'
                }

                for (let key in elements) {
                    article.appendChild(elements[key])
                }

                let final_article = $("#final_article").get(0)
                final_article.value = article.outerHTML

                let finish_article = $("input[name='finished']").get(0)
                finish_article.value = this.lex_article.finished

                if (final_article !== ''){
                    $('#save-article').submit()
                }
            }
        }
    }
});