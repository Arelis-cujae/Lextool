<?php

use yii\helpers\Html;
use yii\widgets\ActiveForm;
use kartik\select2\Select2;
use common\models\User;
use yii\helpers\ArrayHelper;
use dosamigos\datepicker\DateRangePicker;
use backend\models\DocType;

/* @var $this yii\web\View */
/* @var $model backend\models\DocMakePlan */
/* @var $form yii\widgets\ActiveForm */
?>

<div class="doc-make-plan-form">

    <?php $form = ActiveForm::begin([
        'id' => 'doc-make-plan-form',
    ]); ?>

    <?= $form->field($model, 'id_project', ['options' => ['class' => 'hidden']])->textInput() ?>

    <?= $form->field($model,'id_user')->widget(Select2::className(),[
        'data' => ArrayHelper::map(
            User::find()
                ->joinWith('userProjects')
                ->where(['id_project' => $model->id_project])
                ->orderBy('full_name')->all(),
            'id_user','full_name'),
        'options' => ['placeholder' => 'Seleccione...'],
        'language' => 'es',
        'pluginOptions' => [
            'allowClear' => true,
        ],
    ]);
    ?>

    <?= $form->field($model,'docs')->widget(Select2::className(),[
        'data' => ArrayHelper::map(
            DocType::find()
                    ->where(['removed' => false])
                    ->orderBy('name')
                    ->all(),'id_doc_type','name'),
        'options' => ['placeholder' => 'Seleccione...',],
        'pluginOptions' => [
            'allowClear' => true,
            'multiple' => true,
        ],
    ]);
    ?>

    <?= $form->field($model, 'start_date')->widget(
        DateRangePicker::className(), [
        'attributeTo' => 'end_date',
        'form' =>$form,
        'language' => 'es',
        'labelTo' => '-',
        'clientOptions' =>[
            'todayHighlight' => true,
            'autoclose' => true,
            'format' => 'yyyy-mm-dd',
            'daysOfWeekDisabled' => '0.6',
            'minView' => 0,

        ]
    ])->label("Rango de Fecha"); ?>

    <?= $model->isNewRecord ? "":
        $form->field($model, 'finished')->widget(Select2::classname(), [
            'data' => [1=>'Sí', 0=>'No'],
            'options' => [
                'placeholder' => 'Seleccione...',
            ],
            'pluginOptions' => [
                'allowClear' => true,
            ],
        ]) ?>

    <div class="form-group" style="text-align: right">
        <?= Html::submitButton($model->isNewRecord ? 'Guardar' : 'Editar', [
            'class' => $model->isNewRecord ? 'btn btn-success' : 'btn btn-primary']) ?>
        <button type="button" class="btn btn-default" data-dismiss="modal">Cancelar</button>
    </div>

    <?php ActiveForm::end(); ?>

</div>
<script>
    $('form#doc-make-plan-form').on('beforeSubmit', function(e)
    {
        var form = $(this);
        $.post(
            form.attr("action"),
            form.serialize()
        ).done(function(result) {
            if (result == "Error"){
                krajeeDialogError.alert("No se ha podido agregar la tarea, ha ocurrido un error.")
            } else {
                $(form).trigger("reset");
                $.pjax.reload({container: '#doc-make-plan-pjax'});
                $(document).find('#modal').modal('hide');
                krajeeDialogSuccess.alert('La tarea de confección ha sido '+result+'.');
            }
        }).fail(function() {
            krajeeDialogError.alert("Error")
        });
        return false;
    });
</script>