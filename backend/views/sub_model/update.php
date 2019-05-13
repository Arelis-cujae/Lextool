<?php

use yii\widgets\ActiveForm;


/* @var $this yii\web\View */
/* @var $model backend\models\SubModel */

$this->title = 'Editar componente';
//$this->params['breadcrumbs'][] = ['label' => $project->name , 'url' => ['project/view','id' => $project->id_project]];
$this->params['breadcrumbs'][] = ['label' => 'Componentes', 'url' => ['index','id_project' => $project->id_project]];
$this->params['breadcrumbs'][] =  $this->title;
?>
<div id="id_project" class="hidden"><?=$project->id_project?></div>
<div id="name_project" class="hidden"><?=$project->name?></div>
<div class="sub-model-update">



    <div class="row">
        <div  class="col-md-8">
            <?php
            $form = ActiveForm::begin(['id' => 'submodel_form']);
            ?>
            <div class="row">
                <div class="col-md-12">
                    <!--Canvas -->
                    <div class="box box-primary">
                        <div class="box-header with-border">
                            <h2 class="box-title"><i class="fa fa-square-o"></i> Componente</h2>
                        </div>
                        <div class="box-body">
                            <div id="main-frame " data-force="30" class="layer block" style="width: 100%;">
                              
                                <ul id="submodel" class="block__list block__list_tags">
                                    <?php
                                    for ($i = 0; $i < count($ordered); $i++){
                                        if ($ordered[$i]->canGetProperty('id_element')) {
                                            echo '<li id="'.$ordered[$i]->id_element.'"><span id="name" style="font-weight: bold">'.$ordered[$i]->elementType->name.'</span> <span id="property" style="display: none">('.$ordered[$i]->property.')</span>
                                      <input type="hidden" name="element-'.$ordered[$i]->id_element.'" value="'.$ordered[$i]->id_element.'">
                                </li>';
                                        }elseif(($ordered[$i]->canGetProperty('id_separator'))) {
                                            echo '<li id="'.$ordered[$i]->id_separator.'" style="font-weight: bolder; background-color: #dd4b39;"><span style="font-weight: bold">'.$ordered[$i]->representation.'</span> <span style="display: none;">('.$ordered[$i]->scope.')</span>
                                  <input type="hidden" name="separator-'.$ordered[$i]->id_separator.'" value="'.$ordered[$i]->id_separator.'">
                                </li>';
                                        }
                                    }
                                    ?>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-md-12">

                    <div class="box box-primary">
                        <div class="box-header with-border">
                            <p class="box-title"><i class="fa fa-list"></i> Datos del componente</p>
                        </div>
                        <div class="box-body">

                            <?= $form->field($model,'id_project')->hiddenInput(['value' => $project->id_project])->label(false) ?>

                            <?= $form->field($model,'name')->textInput(); ?>


                            <div class="margin-top-20">
                                <?= $form->field($model, 'repeat')->checkbox();?>

                                <?= $form->field($model, 'required')->checkbox();?>
                            </div>

                            <button class="btn btn-primary margin-top-10 margin-bottom-30" type="submit"> Editar</button>
                        </div>
                    </div>

                </div>
            </div>
            <?php
            ActiveForm::end();
            ?>
            <div id="details-section" class="row">
                <div class="col-md-12">
                    <!-- Descripción del Elemento-->
                    <div class="box box-primary">
                        <div class="box-header with-border">
                            <h2 class="box-title"><i class="fa fa-info"></i> Detalles</h2>
                        </div>
                        <div class="box-body">
                            <div class="submodel-container">
                                <div  data-force="30" class="layer block" style="width: 100%;">
                                    <!--  <div class="layer title">Detalles</div>-->
                                    <ul id="details" class="block__list block__list_tags">
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div id="sidebar-form" class="col-md-2" style="padding-left: 0px; padding-right: 0px">
            <div id="elements_section" class="row">
                <!--Listado de Elementos-->
                <div class="col-md-12">
                    <div class="box box-primary">
                        <div class="box-header with-border">
                            <h2 class="box-title"><i class="fa fa-tags"></i> Elementos:</h2>
                        </div>
                        <div class="box-body">
                            <ul id="elements" class="block__list block__list_words">
                                <?php
                                foreach ($elements as $element) {
                                    echo '<li id="'.$element->id_element.'"><span id="name" style="font-weight: bold">'.$element->elementType->name.'</span> <span id="property">('.$element->property.')</span>
                                  <input type="hidden" name="element-'.$element->id_element.'" value="'.$element->id_element.'">
                                </li>';
                                }
                                ?>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-2">
            <div id="separators_section" class="row">
                <!--Listado de Elementos-->
                <div class="col-md-12">
                    <div class="box box-primary">
                        <div class="box-header with-border">
                            <h2 class="box-title"><i class="fa fa-minus"></i> Separadores:</h2>
                        </div>
                        <div class="box-body">
                            <ul id="separators" class="block__list block__list_words">
                                <?php
                                foreach ($separators as $separator) {
                                    echo '<li id="'.$separator->id_separator.'" style="font-weight: bolder; background-color: #dd4b39;"><span>'.$separator->representation.'</span> <span>('.$separator->scope.')</span>
                                  <input type="hidden" name="separator-'.$separator->id_separator.'" value="'.$separator->id_separator.'">
                                </li>';
                                }
                                ?>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>


</div>

<script>
    $(document).ready(function () {
        var list =  $("#submodel li");

        list.each(function () {
            this.className = 'addedItem';

            var span = document.createElement("span");
            var icon = document.createElement("i");
            icon.setAttribute('class','fa fa-trash js-remove');
            span.appendChild(icon);

            this.appendChild(span);
            this.style.cursor = "pointer";

            this.addEventListener('click', function () {

                var id = parseFloat(this.id);

                var url = '/lextool/backend/web/sub_model/details?id='+id;

                $.ajax({
                    url: url,
                    type: 'get',
                    success: function (data) {
                        $("#details-section").fadeIn(1000);
                        $("#details").html(data);
                    }
                });
            });
        });

        //Actualizar separadores
        var i = 0;
        var inc = 1;
        var separators = $(".addedItem input[name^='separator']");
        while (i < separators.length) {
            separators[i].name = 'separator-'+inc;
            i++;
            inc++;
        }

    })
</script>
